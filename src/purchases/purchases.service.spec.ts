import { InMemoryTicketRepository } from '../../test/repositories/inMemory.ticket.repository';
import { PurchasesService } from './purchases.service';
import { InMemoryCustomerRepository } from '../../test/repositories/inMemoryCustomer.repository';
import { InMemoryPurchaseRepository } from '../../test/repositories/inMemoryPurchase.repostory';
import { InMemoryReservationTicketRepository } from '../../test/repositories/inMemoryReservationTicket.repository';
import { BasePaymentService } from '@/payment/basePayment.service';
import { Ticket } from '@/tickets/entities/ticket.entity';
import { Customer } from '@/customers/entities/customer.entity';
import { PurchaseStatusEnum } from './entities/purchase.entity';
import { ReservationTicketStatusEnum } from './entities/reservationTicket.entity';
import { User } from '@/users/entities/user.entity';
import { ImpPaymentService } from '../../test/adapters/ImpPayment.service';
import {
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseRepository } from '@/repositories/purchase.repository';
import { ReservationTicketRepository } from '@/repositories/reservationTicket.repository';
import { TicketRepository } from '@/repositories/ticket.repository';
import { CustomerRepository } from '@/repositories/customer.repository';
import { ConfigModule } from '@nestjs/config';

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
    ticketRepository = new InMemoryTicketRepository();
    customerRepository = new InMemoryCustomerRepository();
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
          provide: ReservationTicketRepository,
          useValue: reservationTicketRepository,
        },
        {
          provide: TicketRepository,
          useValue: ticketRepository,
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
    /* service = new PurchasesService(
      customerRepository,
      ticketRepository,
      purchaseRepository,
      reservationTicketRepository,
      paymentService,
    ); */

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
    await ticketRepository.save([
      ticket,
      Ticket.create({ location: 'north', price: 20.0 }),
    ]);
  });

  it('should be able create an purchase', async () => {
    await service.create(
      {
        ticketIds: [1],
      },
      customer.id,
    );

    expect(purchaseRepository.purchases).toHaveLength(1);
    expect(purchaseRepository.purchases[0].status).toBe(
      PurchaseStatusEnum.PENDING,
    );
    expect(reservationTicketRepository.reservationTicket).toHaveLength(1);
    expect(reservationTicketRepository.reservationTicket[0].status).toBe(
      ReservationTicketStatusEnum.RESERVED,
    );
    expect(ticket.status).toBe('sold');
  });

  it('should return an error if the client is not found', async () => {
    await expect(() =>
      service.create(
        {
          ticketIds: [1],
        },
        2,
      ),
    ).rejects.toThrow(new BadRequestException('customer not found'));
  });
  it('should return an error if a ticket is not found', async () => {
    await expect(() =>
      service.create(
        {
          ticketIds: [1, 10],
        },
        customer.id,
      ),
    ).rejects.toThrow(new BadRequestException('Some tickets not found'));
  });
  it('should return an error if the ticket with the given ID is not available', async () => {
    await service.create(
      {
        ticketIds: [1],
      },
      customer.id,
    );
    await expect(() =>
      service.create(
        {
          ticketIds: [1],
        },
        customer.id,
      ),
    ).rejects.toThrow(
      new BadRequestException('Some tickets are not available'),
    );
  });
  it('should return an error if the ticket is already booked', async () => {
    jest.spyOn(reservationTicketRepository, 'save').mockImplementation(() => {
      throw new UnprocessableEntityException();
    });
    await expect(() =>
      service.create(
        {
          ticketIds: [1],
        },
        customer.id,
      ),
    ).rejects.toThrow(new UnprocessableEntityException());
    expect(purchaseRepository.purchases[0].status).toBe('error');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
