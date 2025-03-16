import { TicketsService } from './tickets.service';
import { InMemoryTicketRepository } from '../../test/repositories/inMemory.ticket.repository';
import { InMemoryPartnerRepository } from '../../test/repositories/inMemoryPartner.repository';
import { Partner } from '@/partners/entities/partner.entity';
import { User } from '@/users/entities/user.entity';

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
});
