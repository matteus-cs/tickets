/* eslint-disable @typescript-eslint/require-await */
import {
  TicketRelation,
  TicketRepository,
} from '@/repositories/ticket.repository';
import { Ticket, TicketStatusEnum } from '@/tickets/entities/ticket.entity';

export class InMemoryTicketRepository implements TicketRepository {
  public tickets: Ticket[] = [];
  async save(ticket: Ticket | Ticket[]): Promise<void> {
    if (Array.isArray(ticket)) {
      for (let i = 0; i < ticket.length; i++) {
        ticket[i].id = this.tickets.length + 1;
        this.tickets.push(ticket[i]);
      }
      return;
    }
    ticket.id = this.tickets.length + 1;
    this.tickets.push(ticket);
  }

  async findById(
    id: number,
    purchaseId?: number | null,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    relation?: TicketRelation,
  ): Promise<Ticket | null> {
    const ticket = this.tickets.find((ticket) => {
      return ticket.id === id;
    });

    if (ticket) {
      if (purchaseId) {
        ticket.purchases = ticket.purchases.filter((p) => p.id === purchaseId);
      } else {
        ticket.purchases = [];
      }
    }

    return ticket ?? null;
  }

  async findByEventId(
    eventId: number,
    limit: number,
    skip: number,
    status?: TicketStatusEnum,
  ): Promise<Ticket[]> {
    let arr: Ticket[];
    if (status) {
      arr = this.tickets.filter(
        (t) => t.event.id === eventId && t.status === status,
      );
    }

    arr = this.tickets.filter((t) => t.event.id === eventId);
    return arr.slice(skip, skip + limit);
  }

  async update(id: number, data: Partial<Ticket>): Promise<void> {
    const index = id - 1;
    const ticket = this.tickets[index];
    if (ticket) {
      for (const key in data) {
        ticket[key] = data[key];
      }
    }
  }
}
