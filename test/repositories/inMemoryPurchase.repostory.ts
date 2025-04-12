/* eslint-disable @typescript-eslint/require-await */
import {
  PurchaseRepository,
  UpdateWherePurchase,
} from '@/repositories/purchase.repository';
import { Purchase } from '@/purchases/entities/purchase.entity';

export class InMemoryPurchaseRepository implements PurchaseRepository {
  async update(
    updateWherePurchase: UpdateWherePurchase,
    data: Partial<Purchase>,
  ): Promise<void> {
    if (updateWherePurchase.id) {
      const index = updateWherePurchase.id - 1;
      const purchase = this.purchases[index];
      if (purchase) {
        for (const key in data) {
          purchase[key] = data[key];
        }
      }
      return;
    }
  }
  public purchases: Purchase[] = [];

  async save(purchase: Purchase): Promise<Purchase> {
    purchase.id = this.purchases.length + 1;
    this.purchases.push(purchase);
    return purchase;
  }

  /* async update(id: number, data: Partial<Purchase>): Promise<void> {
    
  } */
}
