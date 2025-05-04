import { Ticket, TicketStatusEnum } from '@/tickets/entities/ticket.entity';

export type TicketRelation = {
  event: boolean | { partner: boolean };
  purchases: boolean;
};

export abstract class TicketRepository {
  abstract save(ticket: Ticket | Ticket[]): Promise<void>;
  abstract findById(
    id: number,
    purchaseId?: number | null,
    relation?: TicketRelation,
  ): Promise<Ticket | null>;
  abstract findByEventId(
    eventId: number,
    limit: number,
    skip: number,
    status?: TicketStatusEnum,
  ): Promise<Ticket[]>;
  abstract update(id: number, data: Partial<Ticket>): Promise<void>;
}
