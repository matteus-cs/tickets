import { TicketRepository } from '@/repositories/ticket.repository';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Ticket, TicketStatusEnum } from '../entities/ticket.entity';
import { Event } from '@/events/entities/event.entity';

@Injectable()
export class TicketRepositoryAdapter implements TicketRepository {
  constructor(private dataSource: DataSource) {}

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
