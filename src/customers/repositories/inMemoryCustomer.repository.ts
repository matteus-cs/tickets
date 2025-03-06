import { CustomerRepository } from '@/repositories/customer.repository';
import { Customer } from '../entities/customer.entity';

export class InMemoryCustomerRepository implements CustomerRepository {
  public customers: Customer[] = [];
  // eslint-disable-next-line @typescript-eslint/require-await
  async save(customer: Customer): Promise<void> {
    this.customers.push(customer);
  }
  // eslint-disable-next-line @typescript-eslint/require-await
  async findByUserId(userId: number): Promise<Customer | null> {
    return this.customers.find((c) => c.user.id == userId) ?? null;
  }
}
