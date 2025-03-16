/* eslint-disable @typescript-eslint/require-await */
import { TicketRepository } from '@/repositories/ticket.repository';
import { Ticket } from '@/tickets/entities/ticket.entity';

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

  async findById(id: number): Promise<Ticket | null> {
    return this.tickets.find((t) => t.id === id) ?? null;
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
