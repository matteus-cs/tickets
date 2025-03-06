import { Customer } from '@/customers/entities/customer.entity';

export abstract class CustomerRepository {
  abstract save(customer: Customer): Promise<void>;
  abstract findByUserId(userId: number): Promise<Customer | null>;
}
