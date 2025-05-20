import { PurchasesService } from './purchases.service';
import { InMemoryCustomerRepository } from '../../test/repositories/inMemoryCustomer.repository';
import { InMemoryPurchaseRepository } from '../../test/repositories/inMemoryPurchase.repository';
import { InMemoryReservationTicketRepository } from '../../test/repositories/inMemoryReservationTicket.repository';
import { BasePaymentService } from '@/payment/basePayment.service';
import { Ticket } from '@/tickets/entities/ticket.entity';
import { Customer } from '@/customers/entities/customer.entity';
import { PurchaseStatusEnum } from './entities/purchase.entity';
import { ReservationTicket } from '@/reservation/entities/reservationTicket.entity';
import { User } from '@/users/entities/user.entity';
import { ImpPaymentService } from '../../test/adapters/ImpPayment.service';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseRepository } from '@/repositories/purchase.repository';
import { ReservationTicketRepository } from '@/repositories/reservationTicket.repository';
import { CustomerRepository } from '@/repositories/customer.repository';
import { ConfigModule } from '@nestjs/config';
import { InMemoryTicketRepository } from '../../test/repositories/inMemory.ticket.repository';
import { TicketRepository } from '@/repositories/ticket.repository';

describe('PurchasesService', () => {
  let service: PurchasesService;
  let ticketRepository: InMemoryTicketRepository;
  let customerRepository: InMemoryCustomerRepository;
  let purchaseRepository: InMemoryPurchaseRepository;
  let reservationTicketRepository: InMemoryReservationTicketRepository;
  // let paymentService: ImpPaymentService;
  let ticket: Ticket;
  let customer: Customer;
  let user: User;

  beforeEach(async () => {
    customerRepository = new InMemoryCustomerRepository();
    ticketRepository = new InMemoryTicketRepository();
    purchaseRepository = new InMemoryPurchaseRepository();
    reservationTicketRepository = new InMemoryReservationTicketRepository();

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        PurchasesService,
        {
          provide: PurchaseRepository,
          useValue: purchaseRepository,
        },
        {
          provide: TicketRepository,
          useValue: ticketRepository,
        },
        {
          provide: ReservationTicketRepository,
          useValue: reservationTicketRepository,
        },
        {
          provide: CustomerRepository,
          useValue: customerRepository,
        },
        {
          provide: BasePaymentService,
          useClass: ImpPaymentService,
        },
      ],
    }).compile();

    service = module.get<PurchasesService>(PurchasesService);

    const date = new Date();
    user = User.create({
      name: 'john',
      email: 'john@email.com',
      password: 'pwd12345',
      createdAt: date,
    });
    user.id = 1;

    customer = Customer.create({
      address: 'in wonderland',
      phone: '99 99999-9999',
      createdAt: date,
      user,
    });
    await customerRepository.save(customer);

    ticket = Ticket.create({ location: 'vip', price: 40.0 });
    const ticket2 = Ticket.create({ location: 'north', price: 20.0 });

    await ticketRepository.save([ticket, ticket2]);

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);
    await reservationTicketRepository.save([
      ReservationTicket.create({
        id: 1,
        customer,
        ticket,
        expiresAt,
      }),
      ReservationTicket.create({
        id: 2,
        customer,
        ticket: ticket2,
        expiresAt,
      }),
    ]);
  });

  it('should be able create an purchase', async () => {
    await service.create(
      {
        reservationIds: [1],
      },
      customer.id,
    );

    expect(purchaseRepository.purchases).toHaveLength(1);
    expect(purchaseRepository.purchases[0].status).toBe(
      PurchaseStatusEnum.PENDING,
    );
    expect(ticket.status).toBe('sold');
  });

  it('should return an error if the client is not found', async () => {
    await expect(() =>
      service.create(
        {
          reservationIds: [1],
        },
        2,
      ),
    ).rejects.toThrow(new BadRequestException('customer not found'));
  });

  it('should throw a forbidden error if the ticket is not associated with a client', async () => {
    const customer = Customer.create({
      address: 'in test',
      phone: '99 99999-9999',
      createdAt: new Date(),
    });
    await customerRepository.save(customer);

    await expect(() =>
      service.create(
        {
          reservationIds: [1],
        },
        customer.id,
      ),
    ).rejects.toThrow(new ForbiddenException());
  });

  it('should  be able to throw an error not found if a ticket reservation has expired', async () => {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() - 15);
    await reservationTicketRepository.save([
      ReservationTicket.create({
        id: 3,
        customer,
        ticket,
        expiresAt,
      }),
    ]);

    await expect(() =>
      service.create({ reservationIds: [1, 2, 3] }, customer.id),
    ).rejects.toThrow(
      new NotFoundException('Some ticket reservations not found'),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
