import { Purchase } from '@/purchases/entities/purchase.entity';

export type UpdateWherePurchase =
  | { id: number; tickets?: never }
  | {
      id?: never;
      tickets: { id: number };
    };
export abstract class PurchaseRepository {
  abstract save(purchase: Purchase): Promise<Purchase>;
  abstract update(
    updateWherePurchase: UpdateWherePurchase,
    data: Partial<Purchase>,
  ): Promise<void>;
}
