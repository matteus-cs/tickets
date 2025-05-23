import { EventsService } from './events.service';
import { InMemoryEventRepository } from '../../test/repositories/inMemoryEvent.repository';
import { InMemoryPartnerRepository } from '../../test/repositories/inMemoryPartner.repository';
import { Partner } from '@/partners/entities/partner.entity';
import { User } from '@/users/entities/user.entity';
import { Event } from './entities/event.entity';

describe('EventsService', () => {
  let service: EventsService;
  let eventRepository: InMemoryEventRepository;
  let partnerRepository: InMemoryPartnerRepository;
  let user: User;
  let partner: Partner;

  beforeEach(() => {
    eventRepository = new InMemoryEventRepository();
    partnerRepository = new InMemoryPartnerRepository();
    service = new EventsService(eventRepository, partnerRepository);
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
  });

  it('should be able create an event', async () => {
    const date = new Date();
    partnerRepository.partners.push(partner);
    await service.create(
      {
        name: 'event 1',
        description: 'description event 1',
        location: 'mart',
        date,
      },
      { sub: user.id, email: user.email },
    );
    expect(eventRepository.events).toHaveLength(1);
  });

  it('should be able find all events', async () => {
    const date = new Date();
    eventRepository.events.push(
      Event.create({
        name: 'event 1',
        description: 'description event 1',
        date,
        location: 'mart',
        createdAt: date,
        partner,
      }),
      Event.create({
        name: 'event 2',
        description: 'description event 2',
        date,
        location: 'mart',
        createdAt: date,
        partner,
      }),
    );

    const events = await service.findAll();
    expect(events).toHaveLength(2);
  });

  it('should be able find an event by id ', async () => {
    const date = new Date();
    const event = Event.create({
      name: 'event 1',
      description: 'description event 1',
      date,
      location: 'mart',
      createdAt: date,
      partner,
    });
    event.id = 1;
    eventRepository.events.push(
      event,
      Event.create({
        name: 'event 2',
        description: 'description event 2',
        date,
        location: 'mart',
        createdAt: date,
        partner,
      }),
    );

    const eventExpected = await service.findById(1);
    expect(eventExpected).toBeInstanceOf(Event);
  });

  it('should throw an error if an event cannot be found by id ', async () => {
    await expect(service.findById(3)).rejects.toThrow();
  });
});
