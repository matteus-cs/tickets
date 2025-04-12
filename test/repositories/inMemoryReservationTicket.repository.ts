/* eslint-disable @typescript-eslint/require-await */
import {
  ReservationTicketRepository,
  UpdateWhere,
  WhereDelete,
} from '@/repositories/reservationTicket.repository';
import { ReservationTicket } from '@/purchases/entities/reservationTicket.entity';
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
  update(
    updateWhere: UpdateWhere,
    data: Partial<ReservationTicket>,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
  findOneBy(ticketId: number): Promise<ReservationTicket | null> {
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
      }
      this.reservationTicket.push(...reservationTicket);
      return;
    }
    if (ids.includes(reservationTicket.id)) {
      throw new UnprocessableEntityException('ticket no longer available');
    }
    this.reservationTicket.push(reservationTicket);
  }
}
