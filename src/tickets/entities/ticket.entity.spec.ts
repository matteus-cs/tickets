import { Ticket } from './ticket.entity';
import { Event } from '../../events/entities/event.entity';

describe('Ticket Entity', () => {
  it('should be able create an instance of ticket', () => {
    const event = Event.create({
      name: 'event 1',
      description: 'description event 1',
      location: 'mart',
      date: new Date(),
    });
    const ticket = Ticket.create({ location: 'Lest', price: 20.5, event });
    expect(ticket).toBeInstanceOf(Ticket);
    expect(ticket.event).toBeInstanceOf(Event);
  });
});
