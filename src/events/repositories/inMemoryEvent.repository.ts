/* eslint-disable @typescript-eslint/require-await */
import { EventRepository } from '@/repositories/event.repository';
import { Event } from '../entities/event.entity';

export class InMemoryEventRepository implements EventRepository {
  public events: Event[] = [];

  async save(event: Event): Promise<void> {
    this.events.push(event);
  }
  async findAll(partnerId?: number): Promise<Event[]> {
    if (partnerId) this.events.filter((e) => e.partner.id === partnerId);
    return this.events;
  }

  async findById(id: number, partnerId?: number): Promise<Event | null> {
    if (partnerId) {
      return (
        this.events.find((e) => e.id === id && e.partner.id === partnerId) ??
        null
      );
    }
    return this.events.find((e) => e.id === id) ?? null;
  }
}
