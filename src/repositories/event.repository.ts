import { Event } from '@/events/entities/event.entity';

export abstract class EventRepository {
  abstract save(event: Event): Promise<void>;
  abstract findAll(partnerId?: number): Promise<Event[]>;
  abstract findById(id: number, partnerId?: number): Promise<Event | null>;
}
