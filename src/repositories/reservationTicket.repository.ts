import { ReservationTicket } from '@/purchases/entities/reservationTicket.entity';

export type WhereDelete = { id: number } | { ticket: { id: number } };

export abstract class ReservationTicketRepository {
  abstract startTransaction(): Promise<void>;
  abstract commitTransaction(): Promise<void>;
  abstract rollbackTransaction(): Promise<void>;
  abstract release(): Promise<void>;
  abstract save(
    reservationTicket: ReservationTicket | ReservationTicket[],
  ): Promise<void>;

  abstract delete(whereDelete: WhereDelete): Promise<void>;
}
