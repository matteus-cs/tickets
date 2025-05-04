import {
  TicketRelation,
  TicketRepository,
} from '@/repositories/ticket.repository';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Ticket, TicketStatusEnum } from '../entities/ticket.entity';
import { Event } from '@/events/entities/event.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PurchaseStatusEnum } from '@/purchases/entities/purchase.entity';

type TicketWithEventAndPurchase = {
  ticket_id: number;
  ticket_location: string;
  ticket_price: string;
  ticket_status: TicketStatusEnum; // ajuste os valores conforme seu domínio
  ticket_createdAt: Date;
  ticket_eventId: number;

  event_id?: number;
  event_name?: string;
  event_description?: string;
  event_date?: Date;
  event_location?: string;
  event_createdAt?: Date;
  event_partnerId?: number;

  purchase_id?: number;
  purchase_status?: PurchaseStatusEnum; // ajuste conforme seu enum/status
};

@Injectable()
export class TicketRepositoryAdapter implements TicketRepository {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    private dataSource: DataSource,
  ) {}
  async findByEventId(
    eventId: number,
    limit: number,
    skip: number,
    status?: TicketStatusEnum,
  ): Promise<Ticket[]> {
    if (status) {
      return this.ticketRepository.find({
        where: { event: { id: eventId }, status },
        skip,
        take: limit,
      });
    }
    return this.ticketRepository.find({
      where: { event: { id: eventId } },
      skip,
      take: limit,
    });
  }

  async update(id: number, data: Partial<Ticket>): Promise<void> {
    await this.dataSource.getRepository(Ticket).update({ id }, data);
  }

  create(
    location: string,
    price: number,
    status?: TicketStatusEnum,
    createdAt?: Date,
    event?: Partial<Event>,
  ): Ticket {
    return this.dataSource
      .getRepository(Ticket)
      .create({ location, price, status, createdAt, event });
  }

  async save(ticket: Ticket | Ticket[]): Promise<void> {
    await this.dataSource.manager.save(ticket);
  }

  async findById(
    id: number,
    purchaseId?: number | null,
    relations?: TicketRelation,
  ): Promise<Ticket | null> {
    const qb = this.dataSource
      .getRepository(Ticket)
      .createQueryBuilder('ticket');

    if (relations?.event) {
      qb.leftJoinAndSelect('ticket.event', 'event');

      const hasPartner =
        typeof relations.event !== 'boolean' && relations.event.partner;

      if (hasPartner) {
        qb.leftJoinAndSelect('event.partner', 'partner');
      }
    }

    if (relations?.purchases) {
      qb.leftJoin(
        'purchases_tickets_tickets',
        'tp',
        'tp.ticketsId = ticket.id',
      );

      if (purchaseId) {
        qb.leftJoin(
          'purchases',
          'purchase',
          'tp.purchasesId = purchase.id AND purchase.id = :purchaseId',
          { purchaseId },
        );
      } else {
        qb.leftJoin('purchases', 'purchase', 'tp.purchasesId = purchase.id');
      }

      qb.addSelect(['purchase.id', 'purchase.status']);
    }

    qb.where('ticket.id = :ticketId', { ticketId: id });

    const [raw] = <TicketWithEventAndPurchase[]>await qb.execute();

    const ticket = this.dataSource.getRepository(Ticket).create({
      id: raw.ticket_id,
      location: raw.ticket_location,
      price: raw.ticket_price ? Number(raw.ticket_price) : undefined,
      status: raw.ticket_status,
      createdAt: raw.ticket_createdAt,
      event: {
        id: raw.event_id,
        name: raw.event_name,
        description: raw.event_description,
        date: raw.event_date,
        location: raw.event_location,
        createdAt: raw.event_createdAt,
        partner: { id: raw.event_partnerId },
      },
      purchases: [
        {
          id: raw.purchase_id,
          status: raw.purchase_status,
        },
      ],
    });

    return ticket;
  }
}
