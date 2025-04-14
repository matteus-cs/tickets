import { TicketsService } from './tickets.service';
import { InMemoryTicketRepository } from '../../test/repositories/inMemory.ticket.repository';
import { InMemoryPartnerRepository } from '../../test/repositories/inMemoryPartner.repository';
import { Partner } from '@/partners/entities/partner.entity';
import { User } from '@/users/entities/user.entity';
import { Ticket, TicketStatusEnum } from './entities/ticket.entity';

describe('TicketsService', () => {
  let service: TicketsService;
  let ticketRepository: InMemoryTicketRepository;
  let partnerRepository: InMemoryPartnerRepository;
  let user: User;
  let partner: Partner;

  beforeEach(() => {
    ticketRepository = new InMemoryTicketRepository();
    partnerRepository = new InMemoryPartnerRepository();
    service = new TicketsService(ticketRepository, partnerRepository);

    const date = new Date();
    user = User.create({
      name: 'john',
      email: 'john@email.com',
      password: 'pwd12345',
      createdAt: date,
    });
    user.id = 1;
    partner = Partner.create({
      companyName: 'john ilimited',
      createdAt: date,
      user,
    });
    partner.id = 1;
    partnerRepository.partners.push(partner);
  });

  it('should be able create an ticket', async () => {
    await service.create([{ location: 'vip', price: 30 }], 1, 1);

    expect(ticketRepository.tickets).toHaveLength(1);
  });

  it('should be able create ten ticket', async () => {
    await service.create([{ location: 'vip', price: 30, quantity: 10 }], 1, 1);

    expect(ticketRepository.tickets).toHaveLength(10);
  });

  it('should throw an error if partner no exists', async () => {
    await expect(
      service.create([{ location: 'vip', price: 30, quantity: 10 }], 1, 2),
    ).rejects.toThrow();
  });
  it('should be able return tickets', async () => {
    const arr = Array.from({ length: 20 }).map(() =>
      Ticket.create({ location: 'vip', price: 30, event: { id: 1 } }),
    );
    await ticketRepository.save(arr);
    const arr2 = Array.from({ length: 20 }).map(() =>
      Ticket.create({ location: 'vip', price: 30, event: { id: 2 } }),
    );
    await ticketRepository.save(arr2);

    const arr3 = Array.from({ length: 20 }).map(() =>
      Ticket.create({
        location: 'vip',
        price: 30,
        status: TicketStatusEnum.SOLD,
        event: { id: 2 },
      }),
    );
    await ticketRepository.save(arr3);

    const page = 2;
    const tickets = await service.findByEventId(1, 2);

    const ticketsSold = await service.findByEventId(
      1,
      2,
      TicketStatusEnum.SOLD,
    );

    expect(tickets).toHaveLength(10);
    expect(tickets[tickets.length - 1].id).toBe(tickets.length * page);

    expect(ticketsSold).toHaveLength(10);
  });
});
