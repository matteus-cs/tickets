import { User } from '@/users/entities/user.entity';
import { Customer } from './customer.entity';

describe('Customer Entity', () => {
  it('should be able create a instance of customer', () => {
    const customer = Customer.create({
      address: 'in workloads',
      phone: '99 99999-9999',
      user: { id: 1 },
    });

    expect(customer).toBeInstanceOf(Customer);
    expect(customer.user).toBeInstanceOf(User);
  });
});
