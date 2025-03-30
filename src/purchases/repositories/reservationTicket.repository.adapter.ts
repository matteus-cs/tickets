import {
  ReservationTicketRepository,
  WhereDelete,
} from '@/repositories/reservationTicket.repository';
import { ReservationTicket } from '../entities/reservationTicket.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';

@Injectable()
export class ReservationTicketRepositoryAdapter
  implements ReservationTicketRepository
{
  private queryRunner?: QueryRunner | null;
  constructor(private dataSource: DataSource) {}
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
  }
  async save(
    reservationTicket: ReservationTicket | ReservationTicket[],
  ): Promise<void> {
    const repo = this.queryRunner
      ? this.queryRunner.manager
      : this.dataSource.manager;
    await repo.save(reservationTicket);
  }
}
