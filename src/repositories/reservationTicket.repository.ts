import { ReservationTicket } from '@/reservation/entities/reservationTicket.entity';

export type WhereDelete = { id: number } | { ticket: { id: number } };
export type FindWhere =
  | { id: number; ticket?: { id: number } }
  | { id?: number; ticket: { id: number } };

export type UpdateWhere =
  | { id: number; ticket?: never }
  | { id?: never; ticket: { id: number } };

export abstract class ReservationTicketRepository {
  abstract startTransaction(): Promise<void>;
  abstract commitTransaction(): Promise<void>;
  abstract rollbackTransaction(): Promise<void>;
  abstract release(): Promise<void>;
  abstract save(
    reservationTicket: ReservationTicket | ReservationTicket[],
  ): Promise<void>;

  abstract delete(whereDelete: WhereDelete): Promise<void>;

  abstract update(
    updateWhere: UpdateWhere,
    data: Partial<ReservationTicket>,
  ): Promise<void>;
  abstract findOneBy(findWhere: FindWhere): Promise<ReservationTicket | null>;
  abstract findExpired(expiresAt: Date): Promise<ReservationTicket[]>;
}
