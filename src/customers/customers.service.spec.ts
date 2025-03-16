import { User } from '@/users/entities/user.entity';
import { CustomersService } from './customers.service';
import { Customer } from './entities/customer.entity';
import { InMemoryCustomerRepository } from '../../test/repositories/inMemoryCustomer.repository';

describe('CustomersService', () => {
  let service: CustomersService;
  let customerRepository: InMemoryCustomerRepository;

  beforeEach(() => {
    customerRepository = new InMemoryCustomerRepository();
    service = new CustomersService(customerRepository);
  });

  it('should be able create an customer', async () => {
    await service.create({
      name: 'Customer',
      email: 'customer@email.com',
      password: 'pwd12345',
      address: 'in wonderland',
      phone: '99 99999-9999',
    });

    expect(customerRepository.customers).toHaveLength(1);
  });

  it('should be able find customer by user id', async () => {
    const date = new Date();
    const user = User.create({
      name: 'john',
      email: 'john@email.com',
      password: 'pwd12345',
      createdAt: date,
    });
    user.id = 1;
    customerRepository.customers.push(
      Customer.create({
        address: 'in wonderland',
        phone: '99 99999-9999',
        createdAt: date,
        user,
      }),
    );
    const customer = await service.findByUserId(1);

    expect(customer).toBeInstanceOf(Customer);
  });

  it('should throw error if cannot found customer by user id', async () => {
    await expect(service.findByUserId(1)).rejects.toThrow();
  });
});
