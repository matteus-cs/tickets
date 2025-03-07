import { InMemoryTicketRepository } from '@/tickets/repositories/inMemory.ticket.repository';
import { PurchasesService } from './purchases.service';
import { InMemoryCustomerRepository } from '@/customers/repositories/inMemoryCustomer.repository';
import { InMemoryPurchaseRepository } from './repositories/inMemoryPurchase.repostory';
import { InMemoryReservationTicketRepository } from './repositories/inMemoryReservationTicket.repository';
import { PaymentService } from '@/payment/payment.service';
import { Ticket } from '@/tickets/entities/ticket.entity';
import { Customer } from '@/customers/entities/customer.entity';
import { EPurchaseStatus } from './entities/purchase.entity';
import { EReservationTicketStatus } from './entities/reservationTicket.entity';
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
    user = new User('john', 'john@email.com', 'pwd1234', date, date);
    user.id = 1;

    customer = new Customer('in wonderland', '99 99999-9999', undefined, user);
    await customerRepository.save(customer);
    ticket = Ticket.create('vip', 40.0);
    await ticketRepository.save([ticket, Ticket.create('norte', 20.0)]);
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
    expect(purchaseRepository.purchases[0].status).toBe(EPurchaseStatus.PAID);
    expect(reservationTicketRepository.reservationTicket).toHaveLength(1);
    expect(reservationTicketRepository.reservationTicket[0].status).toBe(
      EReservationTicketStatus.RESERVED,
    );
    expect(ticket.status).toBe('sold');
  });
});
