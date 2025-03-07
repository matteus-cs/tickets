//  customer -> find by id {user: true}

import { Purchase } from '@/purchases/entities/purchase.entity';

// tickets -> find by id

// purchase -> save

export abstract class PurchaseRepository {
  abstract save(purchase: Purchase): Promise<Purchase>;
  abstract update(idi: number, data: Partial<Purchase>): Promise<void>;
}
