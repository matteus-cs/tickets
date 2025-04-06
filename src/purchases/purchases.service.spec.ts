import { InMemoryTicketRepository } from '../../test/repositories/inMemory.ticket.repository';
import { PurchasesService } from './purchases.service';
import { InMemoryCustomerRepository } from '../../test/repositories/inMemoryCustomer.repository';
import { InMemoryPurchaseRepository } from '../../test/repositories/inMemoryPurchase.repostory';
import { InMemoryReservationTicketRepository } from '../../test/repositories/inMemoryReservationTicket.repository';
import { PaymentService } from '@/payment/basePayment.service';
import { Ticket } from '@/tickets/entities/ticket.entity';
import { Customer } from '@/customers/entities/customer.entity';
import { PurchaseStatusEnum } from './entities/purchase.entity';
import { ReservationTicketStatusEnum } from './entities/reservationTicket.entity';
import { User } from '@/users/entities/user.entity';

describe('PurchasesService', () => {
  let service: PurchasesService;
  let ticketRepository: InMemoryTicketRepository;
  let customerRepository: InMemoryCustomerRepository;
  let purchaseRepository: InMemoryPurchaseRepository;
  let reservationTicketRepository: InMemoryReservationTicketRepository;
  let paymentService: PaymentService;
  let ticket: Ticket;
  let customer: Customer;
  let user: User;

  beforeEach(async () => {
    ticketRepository = new InMemoryTicketRepository();
    customerRepository = new InMemoryCustomerRepository();
    purchaseRepository = new InMemoryPurchaseRepository();
    reservationTicketRepository = new InMemoryReservationTicketRepository();
    paymentService = new PaymentService();

    service = new PurchasesService(
      customerRepository,
      ticketRepository,
      purchaseRepository,
      reservationTicketRepository,
      paymentService,
    );

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
      Ticket.create({ location: 'norte', price: 20.0 }),
    ]);
  });

  it('should be defined', async () => {
    await service.create(
      {
        ticketIds: [1],
        cardToken: 'visa_token',
      },
      customer.id,
    );

    expect(purchaseRepository.purchases).toHaveLength(1);
    expect(purchaseRepository.purchases[0].status).toBe(
      PurchaseStatusEnum.PAID,
    );
    expect(reservationTicketRepository.reservationTicket).toHaveLength(1);
    expect(reservationTicketRepository.reservationTicket[0].status).toBe(
      ReservationTicketStatusEnum.RESERVED,
    );
    expect(ticket.status).toBe('sold');
  });
});
