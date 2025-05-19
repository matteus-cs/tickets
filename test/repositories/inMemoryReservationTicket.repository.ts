/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
import {
  FindWhere,
  ReservationTicketRepository,
  UpdateWhere,
  WhereDelete,
} from '@/repositories/reservationTicket.repository';
import { ReservationTicket } from '@/reservation/entities/reservationTicket.entity';
import { UnprocessableEntityException } from '@nestjs/common';

export class InMemoryReservationTicketRepository
  implements ReservationTicketRepository
{
  public reservationTicket: ReservationTicket[] = [];
  async startTransaction(): Promise<void> {}
  async commitTransaction(): Promise<void> {}
  async rollbackTransaction(): Promise<void> {}
  async release(): Promise<void> {}

  delete(whereDelete: WhereDelete): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async findOneBy(findWhere: FindWhere): Promise<ReservationTicket | null> {
    const reservation = this.reservationTicket.find((r) => {
      if (findWhere.id && findWhere.id === r.id) {
        return r;
      }
      return r.ticket.id === findWhere.ticket?.id;
    });

    return reservation ?? null;
  }

  update(
    updateWhere: UpdateWhere,
    data: Partial<ReservationTicket>,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
  findExpired(expiresAt: Date): Promise<ReservationTicket[]> {
    throw new Error('Method not implemented.');
  }
  async save(
    reservationTicket: ReservationTicket | ReservationTicket[],
  ): Promise<void> {
    const ids = this.reservationTicket.map((r) => r.id);
    if (Array.isArray(reservationTicket)) {
      for (const r of reservationTicket) {
        if (ids.includes(r.id)) {
          throw new UnprocessableEntityException('ticket no longer available');
        }
        r.id = ids.length + 1;
      }
      this.reservationTicket.push(...reservationTicket);
      return;
    }
    if (ids.includes(reservationTicket.id)) {
      throw new UnprocessableEntityException('ticket no longer available');
    }
    reservationTicket.id = ids.length + 1;
    this.reservationTicket.push(reservationTicket);
  }
}
