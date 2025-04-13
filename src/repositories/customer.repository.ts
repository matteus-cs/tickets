import { Customer } from '@/customers/entities/customer.entity';

export type WhereFindByUser =
  | {
      id: number;
      email?: never;
    }
  | { email: string; id?: never };

export abstract class CustomerRepository {
  abstract save(customer: Customer): Promise<void>;
  abstract findByUser(where: WhereFindByUser): Promise<Customer | null>;
  abstract findById(id: number, user: boolean): Promise<Customer | null>;
}
