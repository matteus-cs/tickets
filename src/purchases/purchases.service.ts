import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { QueryFailedError } from 'typeorm';
import { TicketStatusEnum } from '@/tickets/entities/ticket.entity';
import { EPurchaseStatus, Purchase } from './entities/purchase.entity';
import {
  EReservationTicketStatus,
  ReservationTicket,
} from './entities/reservationTicket.entity';
import { PaymentService } from '@/payment/payment.service';
import { PurchaseRepository } from '@/repositories/purchase.repository';
import { CustomerRepository } from '@/repositories/customer.repository';
import { TicketRepository } from '@/repositories/ticket.repository';
import { ReservationTicketRepository } from '@/repositories/reservationTicket.repository';

@Injectable()
export class PurchasesService {
  constructor(
    private customerRepository: CustomerRepository,

    private ticketRepository: TicketRepository,

    private purchaseRepository: PurchaseRepository,

    private reservationTicketRepository: ReservationTicketRepository,

    private paymentService: PaymentService,
    // private dataSource: DataSource,
  ) {}
  async create(createPurchaseDto: CreatePurchaseDto, customerId: number) {
    const { ticketIds, cardToken } = createPurchaseDto;
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
    if (tickets.some((ticket) => ticket.status !== 'available')) {
      throw new BadRequestException('Some tickets are not available');
    }

    const amount = tickets.reduce((acc, t) => {
      if (t?.price) {
        return acc + Number(t?.price);
      }
    }, 0);

    const purchase = new Purchase(
      new Date(),
      amount as number,
      undefined,
      customer,
      tickets,
    );
    const { id: purchaseId } = await this.purchaseRepository.save(purchase);
    try {
      await this.reservationTicketRepository.startTransaction();
      // purchase.status = EPurchaseStatus.PAID;
      await this.purchaseRepository.update(purchaseId, {
        status: EPurchaseStatus.PAID,
      });
      const reservations = tickets.map((t) => {
        const reservation = new ReservationTicket();
        reservation.reservationDate = new Date();
        reservation.status = EReservationTicketStatus.RESERVED;
        reservation.customer = customer;
        reservation.ticket = t;
        return reservation;
      });
      await this.reservationTicketRepository.save(reservations);

      this.paymentService.processPayment(
        {
          name: customer.user.name,
          email: customer.user.email,
          phone: customer.phone,
          address: customer.address,
        },
        purchase.totalAmount,
        cardToken,
      );

      await Promise.all(
        tickets.map((t) => {
          return this.ticketRepository.update(t.id, {
            status: TicketStatusEnum.SOLD,
          });
        }),
      );
      await this.reservationTicketRepository.commitTransaction();
    } catch (error) {
      await this.reservationTicketRepository.rollbackTransaction();
      await this.purchaseRepository.update(purchaseId, {
        status: EPurchaseStatus.ERROR,
      });
      if (error instanceof QueryFailedError) {
        throw new UnprocessableEntityException('ticket no longer available');
      }
      throw error;
    } finally {
      await this.reservationTicketRepository.release();
    }
    /*  try {
      await queryRunner.startTransaction();

      purchase.status = EPurchaseStatus.PAID;
      await queryRunner.manager.save(purchase);

      const reservations = tickets.map((t) => {
        const reservation = new ReservationTicket();
        reservation.reservationDate = new Date();
        reservation.customer = customer;
        reservation.ticket = t;
        return reservation;
      });
      const arrPromise = reservations.map((r) => queryRunner.manager.save(r));
      await Promise.all(arrPromise);

      this.paymentService.processPayment(
        {
          name: customer.user.name,
          email: customer.user.email,
          phone: customer.phone,
          address: customer.address,
        },
        purchase.totalAmount,
        cardToken,
      );
      await Promise.all(
        tickets.map((t) => {
          return queryRunner.manager.update(Ticket, t.id, {
            status: TicketStatusEnum.SOLD,
          });
        }),
      );
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      purchase.status = EPurchaseStatus.ERROR;
      await queryRunner.manager.save(purchase);
      if (error instanceof QueryFailedError) {
        throw new UnprocessableEntityException('ticket no longer available');
      }
      throw error;
    } finally {
      await queryRunner.release();
    } */
  }
}
