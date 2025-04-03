import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ReservationTicketRepository } from '../repositories/reservationTicket.repository';
import { TicketRepository } from '../repositories/ticket.repository';
import { PurchaseRepository } from '../repositories/purchase.repository';
import { TicketStatusEnum } from '../tickets/entities/ticket.entity';
import { PurchaseStatusEnum } from './entities/purchase.entity';

@Injectable()
export class TasksService {
  constructor(
    private reservationTicketRepository: ReservationTicketRepository,
    private ticketRepository: TicketRepository,
    private purchaseRepository: PurchaseRepository,
  ) {}

  @Cron('*/1 * * * *')
  async expireReservations() {
    const now = new Date();
    const expiredReservations =
      await this.reservationTicketRepository.findExpired(now);

    for (const reservation of expiredReservations) {
      await this.ticketRepository.update(reservation.ticket.id, {
        status: TicketStatusEnum.AVAILABLE,
      });

      await this.reservationTicketRepository.delete({ id: reservation.id });

      await this.purchaseRepository.update(
        {
          tickets: { id: reservation.ticket.id },
        },
        { status: PurchaseStatusEnum.ERROR },
      );
    }
  }
}
