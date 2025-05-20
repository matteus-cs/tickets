import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { Purchase, PurchaseStatusEnum } from './entities/purchase.entity';
import { PurchaseRepository } from '@/repositories/purchase.repository';
import { CustomerRepository } from '@/repositories/customer.repository';
import { ReservationTicketRepository } from '@/repositories/reservationTicket.repository';
import { BasePaymentService } from '@/payment/basePayment.service';
import { TicketStatusEnum } from '@/tickets/entities/ticket.entity';
import { TicketRepository } from '@/repositories/ticket.repository';
import { ReservationTicket } from '@/reservation/entities/reservationTicket.entity';

@Injectable()
export class PurchasesService {
  constructor(
    private customerRepository: CustomerRepository,

    private ticketRepository: TicketRepository,

    private purchaseRepository: PurchaseRepository,

    private reservationTicketRepository: ReservationTicketRepository,

    private paymentService: BasePaymentService,
  ) {}
  async create(createPurchaseDto: CreatePurchaseDto, customerId: number) {
    const { reservationIds } = createPurchaseDto;
    const customer = await this.customerRepository.findById(customerId, true);
    if (!customer) {
      throw new NotFoundException('customer not found');
    }

    const reservationsTickets = (
      await Promise.all(
        reservationIds.map((id) =>
          this.reservationTicketRepository.findOneBy({ id }),
        ),
      )
    )
      .filter((r): r is ReservationTicket => r !== null)
      .filter((r) => r.expiresAt.getTime() >= Date.now());

    if (reservationsTickets.length < reservationIds.length) {
      throw new NotFoundException('Some ticket reservations not found');
    }
    const tickets = reservationsTickets
      .filter((r) => r.customer.id === customerId)
      .map((r) => r.ticket);
    if (tickets.length < reservationIds.length) {
      throw new ForbiddenException();
    }

    const amount = tickets.reduce((acc, t) => {
      if (t?.price) {
        return acc + Number(t?.price);
      }
    }, 0);

    const purchase = Purchase.create({
      purchaseDate: new Date(),
      totalAmount: amount as number,
      customer,
      tickets,
    });
    const { id: purchaseId } = await this.purchaseRepository.save(purchase);

    try {
      const ticketIds = tickets.map((t) => t.id);
      const { clientSecret } = await this.paymentService.processPayment({
        amount: Math.round((amount as number) * 100),
        metadata: {
          customerId: customer.id,
          purchaseId: purchaseId,
          ticketIds,
        },
      });
      await Promise.all(
        tickets.map((t) => {
          return this.ticketRepository.update(t.id, {
            status: TicketStatusEnum.SOLD,
          });
        }),
      );
      return { clientSecret };
    } catch (error) {
      await this.purchaseRepository.update(
        { id: purchaseId },
        { status: PurchaseStatusEnum.ERROR },
      );
      throw error;
    }
  }

  async confirmPayment(payload: any, signature: string) {
    await this.paymentService.confirmedPayment({ payload, signature });
  }
}
