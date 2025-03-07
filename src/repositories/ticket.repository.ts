import { Ticket } from '@/tickets/entities/ticket.entity';

export abstract class TicketRepository {
  abstract save(ticket: Ticket | Ticket[]): Promise<void>;
  abstract findById(id: number): Promise<Ticket | null>;
  abstract update(id: number, data: Partial<Ticket>): Promise<void>;
}
