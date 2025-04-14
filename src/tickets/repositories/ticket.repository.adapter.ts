import { TicketRepository } from '@/repositories/ticket.repository';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Ticket, TicketStatusEnum } from '../entities/ticket.entity';
import { Event } from '@/events/entities/event.entity';
import { InjectRepository } from '@nestjs/typeorm';

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

  async findById(id: number): Promise<Ticket | null> {
    return await this.dataSource.getRepository(Ticket).findOneBy({ id });
  }
}
