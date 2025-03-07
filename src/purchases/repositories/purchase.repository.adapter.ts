import { PurchaseRepository } from '@/repositories/purchase.repository';
import { Purchase } from '../entities/purchase.entity';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PurchaseRepositoryAdapter implements PurchaseRepository {
  constructor(private dataSource: DataSource) {}
  async save(purchase: Purchase): Promise<void> {
    await this.dataSource.manager.save(purchase);
  }
}
