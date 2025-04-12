import {
  ReservationTicketRepository,
  UpdateWhere,
  WhereDelete,
} from '@/repositories/reservationTicket.repository';
import { ReservationTicket } from '../entities/reservationTicket.entity';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { DataSource, LessThan, QueryFailedError, QueryRunner } from 'typeorm';

@Injectable()
export class ReservationTicketRepositoryAdapter
  implements ReservationTicketRepository
{
  private queryRunner?: QueryRunner | null;
  constructor(private dataSource: DataSource) {}
  async update(
    updateWhere: UpdateWhere,
    data: Partial<ReservationTicket>,
  ): Promise<void> {
    await this.dataSource.manager.update(ReservationTicket, updateWhere, data);
  }
  async findExpired(expiresAt: Date): Promise<ReservationTicket[]> {
    return await this.dataSource.manager.findBy(ReservationTicket, {
      expiresAt: LessThan(expiresAt),
    });
  }
  async findOneBy(ticketId: number): Promise<ReservationTicket | null> {
    const manager = this.queryRunner
      ? this.queryRunner.manager
      : this.dataSource.manager;
    return await manager.findOneBy(ReservationTicket, {
      ticket: { id: ticketId },
    });
  }
  async delete(whereDelete: WhereDelete): Promise<void> {
    const manager = this.queryRunner
      ? this.queryRunner.manager
      : this.dataSource.manager;
    await manager.delete(ReservationTicket, whereDelete);
  }
  async startTransaction(): Promise<void> {
    this.queryRunner = this.dataSource.createQueryRunner();
    await this.queryRunner.connect();
    await this.queryRunner.startTransaction();
  }
  async commitTransaction(): Promise<void> {
    await this.queryRunner?.commitTransaction();
  }
  async rollbackTransaction(): Promise<void> {
    await this.queryRunner?.rollbackTransaction();
  }
  async release(): Promise<void> {
    await this.queryRunner?.release();
    this.queryRunner = null;
  }
  async save(
    reservationTicket: ReservationTicket | ReservationTicket[],
  ): Promise<void> {
    const repo = this.queryRunner
      ? this.queryRunner.manager
      : this.dataSource.manager;
    try {
      await repo.save(reservationTicket);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new UnprocessableEntityException('ticket no longer available');
      }
    }
  }
}
