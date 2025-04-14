import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketRepository } from '@/repositories/ticket.repository';
import { PartnerRepository } from '@/repositories/partner.repository';
import { Ticket, TicketStatusEnum } from './entities/ticket.entity';

@Injectable()
export class TicketsService {
  constructor(
    private ticketsRepository: TicketRepository,

    private partnersRepository: PartnerRepository,
  ) {}
  async create(
    createTicketDto: CreateTicketDto[],
    eventId: number,
    userId: number,
  ) {
    const partner = await this.partnersRepository.findByUserId(userId);

    if (!partner) {
      throw new UnauthorizedException();
    }
    const tickets = createTicketDto.reduce<Ticket[]>((acc, ticket) => {
      if (ticket.quantity) {
        for (let i = 0; i < ticket.quantity; i++) {
          acc.push(
            Ticket.create({
              location: ticket.location,
              price: ticket.price,
              event: { id: eventId },
            }),
          );
        }
        return acc;
      }
      return [
        ...acc,
        Ticket.create({
          location: ticket.location,
          price: ticket.price,
          event: { id: eventId },
        }),
      ];
    }, []);

    await this.ticketsRepository.save(tickets);
  }

  async findByEventId(
    eventId: number,
    page: number,
    status?: TicketStatusEnum,
  ) {
    const limit = 10;
    const skip = page * limit - limit;
    return await this.ticketsRepository.findByEventId(
      eventId,
      10,
      skip,
      status,
    );
  }
}
