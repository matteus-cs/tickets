import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketRepository } from '@/repositories/ticket.repository';
import { PartnerRepository } from '@/repositories/partner.repository';
import { Ticket, TicketStatusEnum } from './entities/ticket.entity';
import { PurchaseStatusEnum } from '@/purchases/entities/purchase.entity';
import { Cryptography } from './utils/cryptography';
import { CustomerRepository } from '@/repositories/customer.repository';
import { ErrorCode } from '@/error-code';

@Injectable()
export class TicketsService {
  constructor(
    private ticketsRepository: TicketRepository,

    private partnersRepository: PartnerRepository,

    private customerRepository: CustomerRepository,

    private cryptography: Cryptography,
  ) {}
  async create(
    createTicketDto: CreateTicketDto[],
    eventId: number,
    userId: number,
  ) {
    const partner = await this.partnersRepository.findByUserId(userId);

    if (!partner) {
      throw new ForbiddenException({ code: ErrorCode.AUTH_FORBIDDEN });
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

  async createTicketHash(
    ticketId: number,
    purchaseId: number,
    customerId: number,
  ) {
    const ticket = await this.ticketsRepository.findById(ticketId, purchaseId, {
      event: true,
      purchases: true,
    });
    if (!ticket) {
      throw new NotFoundException({ code: ErrorCode.TICKET_NOT_FOUND });
    }

    const purchase = ticket.purchases[0];

    if (!purchase || purchase.id !== purchaseId) {
      throw new NotFoundException({ code: ErrorCode.PURCHASE_NOT_FOUND });
    }

    const customer = await this.customerRepository.findById(customerId, false);

    if (!customer || (customer && customer.id !== customerId)) {
      throw new ForbiddenException({ code: ErrorCode.AUTH_FORBIDDEN });
    }

    if (
      ticket.status !== TicketStatusEnum.SOLD ||
      purchase.status !== PurchaseStatusEnum.PAID
    ) {
      throw new UnprocessableEntityException({
        code: ErrorCode.PURCHASE_INVALID_STATE,
      });
    }

    const hash = this.cryptography.encrypt(`${ticketId}:${ticket.event.id}`);

    return { hash };
  }

  // validate if ticket is from current event
  async validate(partnerId: number, eventId: number, hash: string) {
    const decrypted = this.cryptography.decrypt(hash);
    const [ticketId, ticketHashEventId] = decrypted.split(':');

    const ticket = await this.ticketsRepository.findById(+ticketId, null, {
      event: { partner: true },
      purchases: false,
    });

    if (ticket) {
      if (ticket.event.partner.id !== partnerId)
        throw new ForbiddenException({ code: ErrorCode.AUTH_FORBIDDEN });

      const isValid =
        +ticketHashEventId === eventId &&
        ticket.status === TicketStatusEnum.SOLD;

      return isValid;
    } else {
      return false;
    }
  }
}
