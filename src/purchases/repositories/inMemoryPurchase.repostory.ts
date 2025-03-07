/* eslint-disable @typescript-eslint/require-await */
import { PurchaseRepository } from '@/repositories/purchase.repository';
import { Purchase } from '../entities/purchase.entity';

export class InMemoryPurchaseRepository implements PurchaseRepository {
  public purchases: Purchase[] = [];

  async save(purchase: Purchase): Promise<Purchase> {
    purchase.id = this.purchases.length + 1;
    this.purchases.push(purchase);
    return purchase;
  }

  async update(id: number, data: Partial<Purchase>): Promise<void> {
    const index = id - 1;
    const purchase = this.purchases[index];
    if (purchase) {
      for (const key in data) {
        purchase[key] = data[key];
      }
    }
  }
}
