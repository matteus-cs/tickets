import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { Repository } from 'typeorm';
import { Partner } from '@/partners/entities/partner.entity';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,

    @InjectRepository(Partner)
    private partnersRepository: Repository<Partner>,
  ) {}
  async create(
    createTicketDto: CreateTicketDto[],
    eventId: number,
    userId: number,
  ) {
    const partner = await this.partnersRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!partner) {
      throw new UnauthorizedException();
    }
    const tickets = createTicketDto.reduce<CreateTicketDto[]>((acc, ticket) => {
      if (ticket.quantity) {
        for (let i = 0; i < ticket.quantity; i++) {
          acc.push(
            this.ticketsRepository.create({
              location: ticket.location,
              price: ticket.price,
              createdAt: new Date(),
              event: { id: eventId },
            }),
          );
        }
        return acc;
      }
      return [
        ...acc,
        this.ticketsRepository.create({
          location: ticket.location,
          price: ticket.price,
          createdAt: new Date(),
          event: { id: eventId },
        }),
      ];
    }, []);

    const ticketsPromises = tickets.map((ticket) =>
      this.ticketsRepository.save(ticket),
    );

    await Promise.all(ticketsPromises);
  }
}
