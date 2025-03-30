import { PurchaseRepository } from '@/repositories/purchase.repository';
import { Purchase } from '../entities/purchase.entity';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PurchaseRepositoryAdapter implements PurchaseRepository {
  constructor(private dataSource: DataSource) {}
  async update(id: number, data: Partial<Purchase>): Promise<void> {
    await this.dataSource.manager.update(Purchase, { id }, data);
  }
  async save(purchase: Purchase): Promise<Purchase> {
    return await this.dataSource.manager.save(purchase);
  }
}
