import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketRepository } from '@/repositories/ticket.repository';
import { PartnerRepository } from '@/repositories/partner.repository';
import { Ticket } from './entities/ticket.entity';

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
            Ticket.create(ticket.location, ticket.price, undefined, undefined, {
              id: eventId,
            }),
          );
        }
        return acc;
      }
      return [
        ...acc,
        Ticket.create(ticket.location, ticket.price, undefined, undefined, {
          id: eventId,
        }),
      ];
    }, []);

    await this.ticketsRepository.save(tickets);
  }
}
