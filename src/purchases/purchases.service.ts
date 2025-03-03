import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { Customer } from '@/customers/entities/customer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket, TicketStatusEnum } from '@/tickets/entities/ticket.entity';
import { EPurchaseStatus, Purchase } from './entities/purchase.entity';
import { ReservationTicket } from './entities/reservationTicket.entity';
import { PaymentService } from '@/payment/payment.service';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,

    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,

    @InjectRepository(Purchase)
    private purchaseRepository: Repository<Purchase>,

    private dataSource: DataSource,
    private paymentService: PaymentService,
  ) {}
  async create(createPurchaseDto: CreatePurchaseDto, customerId: number) {
    const { ticketIds, cardToken } = createPurchaseDto;
    const customer = await this.customerRepository
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.user', 'user')
      .where('customer.id = :id', { id: customerId })
      .getOne();
    if (!customer) {
      throw new NotFoundException('customer not found');
    }

    const findAllTicketPromises = ticketIds.map((id) =>
      this.ticketRepository.findOneBy({ id }),
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

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    const purchase = this.purchaseRepository.create({
      purchaseDate: new Date(),
      totalAmount: amount,
      tickets: tickets,
      customer,
    });
    try {
      await queryRunner.startTransaction();
      await queryRunner.manager.save(purchase);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    }
    try {
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
    }
  }
}
