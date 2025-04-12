import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { TicketStatusEnum } from '@/tickets/entities/ticket.entity';
import { Purchase, PurchaseStatusEnum } from './entities/purchase.entity';
import { ReservationTicket } from './entities/reservationTicket.entity';
import { PurchaseRepository } from '@/repositories/purchase.repository';
import { CustomerRepository } from '@/repositories/customer.repository';
import { TicketRepository } from '@/repositories/ticket.repository';
import { ReservationTicketRepository } from '@/repositories/reservationTicket.repository';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { BasePaymentService } from '@/payment/basePayment.service';

@Injectable()
export class PurchasesService {
  private stripe: Stripe;
  constructor(
    private customerRepository: CustomerRepository,

    private ticketRepository: TicketRepository,

    private purchaseRepository: PurchaseRepository,

    private reservationTicketRepository: ReservationTicketRepository,

    private paymentService: BasePaymentService,

    private configService: ConfigService,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_API_KEY') as string,
    );
  }
  async create(createPurchaseDto: CreatePurchaseDto, customerId: number) {
    const { ticketIds } = createPurchaseDto;
    const customer = await this.customerRepository.findById(customerId, true);
    if (!customer) {
      throw new NotFoundException('customer not found');
    }

    const findAllTicketPromises = ticketIds.map((id) =>
      this.ticketRepository.findById(id),
    );

    const tickets = (await Promise.all(findAllTicketPromises)).filter(
      (t) => t !== null,
    );

    if (tickets.length !== ticketIds.length) {
      throw new NotFoundException('Some tickets not found');
    }
    if (
      tickets.some((ticket) => ticket.status !== TicketStatusEnum.AVAILABLE)
    ) {
      throw new BadRequestException('Some tickets are not available');
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

    const { clientSecret } = await this.paymentService.processPayment({
      amount: Math.round((amount as number) * 100),
      metadata: {
        customerId: customer.id,
        purchaseId: purchaseId,
        ticketIds,
      },
    });

    try {
      await this.reservationTicketRepository.startTransaction();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 15 * 60000);
      const reservations = tickets.map((t) => {
        const reservation = ReservationTicket.create({
          reservationDate: now,
          expiresAt,
          customer,
          ticket: t,
        });
        return reservation;
      });
      await this.reservationTicketRepository.save(reservations);
      await this.reservationTicketRepository.commitTransaction();
      await this.reservationTicketRepository.release();

      await Promise.all(
        tickets.map((t) => {
          return this.ticketRepository.update(t.id, {
            status: TicketStatusEnum.SOLD,
          });
        }),
      );
    } catch (error) {
      await this.reservationTicketRepository.rollbackTransaction();
      await this.purchaseRepository.update(
        { id: purchaseId },
        { status: PurchaseStatusEnum.ERROR },
      );
      throw error;
    }
    return { clientSecret };
  }

  async confirmPayment(payload: any, signature: string) {
    await this.paymentService.confirmedPayment({ payload, signature });
  }
}
