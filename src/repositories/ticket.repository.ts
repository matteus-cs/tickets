import { Ticket, TicketStatusEnum } from '@/tickets/entities/ticket.entity';

export abstract class TicketRepository {
  abstract save(ticket: Ticket | Ticket[]): Promise<void>;
  abstract findById(id: number): Promise<Ticket | null>;
  abstract findByEventId(
    eventId: number,
    limit: number,
    skip: number,
    status?: TicketStatusEnum,
  ): Promise<Ticket[]>;
  abstract update(id: number, data: Partial<Ticket>): Promise<void>;
}
