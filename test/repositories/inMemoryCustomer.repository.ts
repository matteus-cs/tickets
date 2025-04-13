/* eslint-disable @typescript-eslint/require-await */
import {
  CustomerRepository,
  WhereFindByUser,
} from '@/repositories/customer.repository';
import { Customer } from '@/customers/entities/customer.entity';

export class InMemoryCustomerRepository implements CustomerRepository {
  public customers: Customer[] = [];

  async save(customer: Customer): Promise<void> {
    customer.id = this.customers.length + 1;
    this.customers.push(customer);
  }

  async findByUserId(userId: number): Promise<Customer | null> {
    return this.customers.find((c) => c.user.id == userId) ?? null;
  }

  async findById(id: number): Promise<Customer | null> {
    return this.customers.find((c) => c.id == id) ?? null;
  }

  async findByUser(where: WhereFindByUser): Promise<Customer | null> {
    if (where.id) {
      return this.customers.find((c) => c.user.id == where.id) ?? null;
    }
    return this.customers.find((c) => c.user.email == where.email) ?? null;
  }
}
