import { Event } from './event.entity';

describe('Event Entity', () => {
  it('should be able create a instance of event', () => {
    const event = Event.create({
      name: 'event 1',
      description: 'description event 1',
      location: 'mart',
      date: new Date(),
    });
    expect(event).toBeInstanceOf(Event);
    expect(event.createdAt).toBeDefined();
  });
});
