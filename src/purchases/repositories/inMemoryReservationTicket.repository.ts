/* eslint-disable @typescript-eslint/require-await */
import { ReservationTicketRepository } from '@/repositories/reservationTicket.repository';
import { ReservationTicket } from '../entities/reservationTicket.entity';

export class InMemoryReservationTicketRepository
  implements ReservationTicketRepository
{
  public reservationTicket: ReservationTicket[] = [];
  async startTransaction(): Promise<void> {}
  async commitTransaction(): Promise<void> {}
  async rollbackTransaction(): Promise<void> {}
  async release(): Promise<void> {}
  async save(
    reservationTicket: ReservationTicket | ReservationTicket[],
  ): Promise<void> {
    if (Array.isArray(reservationTicket)) {
      this.reservationTicket.push(...reservationTicket);
      return;
    }
    this.reservationTicket.push(reservationTicket);
  }
}
