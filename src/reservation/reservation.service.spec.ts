import { Test, TestingModule } from '@nestjs/testing';
import { ReservationService } from './reservation.service';
import { InMemoryReservationTicketRepository } from '../../test/repositories/inMemoryReservationTicket.repository';
import { InMemoryCustomerRepository } from '../../test/repositories/inMemoryCustomer.repository';
import { InMemoryTicketRepository } from '../../test/repositories/inMemory.ticket.repository';
import { ReservationTicketRepository } from '@/repositories/reservationTicket.repository';
import { CustomerRepository } from '@/repositories/customer.repository';
import { TicketRepository } from '@/repositories/ticket.repository';
import { Customer } from '@/customers/entities/customer.entity';
import { Ticket, TicketStatusEnum } from '@/tickets/entities/ticket.entity';
import { User } from '@/users/entities/user.entity';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common/exceptions';

describe('ReservationService', () => {
  let service: ReservationService;

  let reservationRepository: InMemoryReservationTicketRepository;
  let customerRepository: InMemoryCustomerRepository;
  let ticketRepository: InMemoryTicketRepository;
  let user: User;
  let customer: Customer;
  let ticket: Ticket;

  beforeEach(async () => {
    reservationRepository = new InMemoryReservationTicketRepository();
    customerRepository = new InMemoryCustomerRepository();
    ticketRepository = new InMemoryTicketRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationService,
        {
          provide: ReservationTicketRepository,
          useValue: reservationRepository,
        },
        {
          provide: CustomerRepository,
          useValue: customerRepository,
        },
        {
          provide: TicketRepository,
          useValue: ticketRepository,
        },
      ],
    }).compile();

    service = module.get<ReservationService>(ReservationService);

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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be able to book a ticket', async () => {
    await service.create({ ticketIds: [1] }, customer.id);

    const ticket = ticketRepository.tickets.find((t) => t.id === 1);

    expect(ticket?.status).toBe(TicketStatusEnum.RESERVED);
    expect(reservationRepository.reservationTicket).toHaveLength(1);
  });

  it('should return an error if a ticket is not found', async () => {
    await expect(() =>
      service.create(
        {
          ticketIds: [1, 10],
        },
        customer.id,
      ),
    ).rejects.toThrow(new NotFoundException('Some tickets not found'));
  });
  it('should return an error if the ticket with the given ID is not available', async () => {
    ticket.status = TicketStatusEnum.RESERVED;
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
});
