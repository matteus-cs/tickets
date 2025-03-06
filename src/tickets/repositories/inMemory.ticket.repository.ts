import { TicketRepository } from '@/repositories/ticket.repository';
import { Ticket, TicketStatusEnum } from '../entities/ticket.entity';
import { Event } from '@/events/entities/event.entity';

export class InMemoryTicketRepository implements TicketRepository {
  public tickets: Ticket[] = [];
  create(
    location: string,
    price: number,
    status?: TicketStatusEnum,
    createdAt?: Date,
    event?: Partial<Event>,
  ): Ticket {
    const ticket = Ticket.create(location, price, status, createdAt);
    ticket.event = new Event();
    if (event?.id) {
      ticket.event.id = event.id;
    }
    return ticket;
  }
  // eslint-disable-next-line @typescript-eslint/require-await
  async save(ticket: Ticket | Ticket[]): Promise<void> {
    if (Array.isArray(ticket)) {
      this.tickets.push(...ticket);
      return;
    }
    this.tickets.push(ticket);
  }
}
