import { Purchase, PurchaseStatusEnum } from './purchase.entity';

describe('Purchase Entity', () => {
  it('should be able create an instance purchase', () => {
    const purchase = Purchase.create({
      purchaseDate: new Date(),
      totalAmount: 200,
      tickets: [{ id: 1 }, { id: 2 }, { id: 3 }],
    });

    expect(purchase).toBeInstanceOf(Purchase);
    expect(purchase.status).toBe(PurchaseStatusEnum.PENDING);
  });
});
