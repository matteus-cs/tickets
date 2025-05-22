import { ReservationTicketRepository } from '@/repositories/reservationTicket.repository';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { TicketStatusEnum } from '@/tickets/entities/ticket.entity';
import { CustomerRepository } from '@/repositories/customer.repository';
import { TicketRepository } from '@/repositories/ticket.repository';
import { ReservationTicket } from './entities/reservationTicket.entity';
import { ErrorCode } from '@/error-code';

@Injectable()
export class ReservationService {
  constructor(
    private reservationRepository: ReservationTicketRepository,
    private customerRepository: CustomerRepository,
    private ticketRepository: TicketRepository,
  ) {}

  async create(createReservationDto: CreateReservationDto, customerId: number) {
    const { ticketIds } = createReservationDto;
    const customer = await this.customerRepository.findById(customerId, true);
    if (!customer) {
      throw new NotFoundException({ code: ErrorCode.CUSTOMER_NOT_FOUND });
    }

    const findAllTicketPromises = ticketIds.map((id) =>
      this.ticketRepository.findById(id),
    );

    const tickets = (await Promise.all(findAllTicketPromises)).filter(
      (t) => t !== null,
    );

    if (tickets.length !== ticketIds.length) {
      throw new NotFoundException({
        code: ErrorCode.TICKET_NOT_FOUND,
        message: 'Some tickets not found',
      });
    }
    if (
      tickets.some((ticket) => ticket.status !== TicketStatusEnum.AVAILABLE)
    ) {
      throw new BadRequestException({
        code: ErrorCode.TICKET_NOT_AVAILABLE,
        message: 'Some tickets are not available',
      });
    }

    try {
      await this.reservationRepository.startTransaction();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 15 * 60000);
      const reservations = tickets.map((t) => {
        const reservation = ReservationTicket.create({
          reservationDate: now,
          expiresAt,
          customer,
          ticket: t,
        });
        return reservation;
      });
      await this.reservationRepository.save(reservations);
      await this.reservationRepository.commitTransaction();
      await this.reservationRepository.release();

      await Promise.all(
        tickets.map((t) => {
          return this.ticketRepository.update(t.id, {
            status: TicketStatusEnum.RESERVED,
          });
        }),
      );
    } catch (error) {
      await this.reservationRepository.rollbackTransaction();
      throw error;
    }
  }
}
