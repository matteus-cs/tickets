import { Ticket } from '@/tickets/entities/ticket.entity';

export abstract class TicketRepository {
  abstract save(ticket: Ticket | Ticket[]): Promise<void>;
}
