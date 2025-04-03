import {
  PurchaseRepository,
  UpdateWherePurchase,
} from '@/repositories/purchase.repository';
import { Purchase, PurchaseStatusEnum } from '../entities/purchase.entity';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PurchaseRepositoryAdapter implements PurchaseRepository {
  constructor(private dataSource: DataSource) {}
  async update(
    updateWherePurchase: UpdateWherePurchase,
    data: Partial<Purchase>,
  ): Promise<void> {
    const repo = this.dataSource.getRepository(Purchase);
    if (updateWherePurchase.id) {
      await repo.update({ id: updateWherePurchase.id }, data);
      return;
    }

    const purchaseId = await repo
      .findOneBy({ ...updateWherePurchase, status: PurchaseStatusEnum.PENDING })
      .then((p) => p?.id);
    if (purchaseId) {
      await repo.update(purchaseId, data);
    }
  }
  async save(purchase: Purchase): Promise<Purchase> {
    return await this.dataSource.manager.save(purchase);
  }
}
