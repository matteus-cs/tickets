import { User } from '@/users/entities/user.entity';
import { CustomersService } from './customers.service';
import { Customer } from './entities/customer.entity';
import { InMemoryCustomerRepository } from './repositories/inMemoryCustomer.repository';

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
      password: 'pwd1234',
      address: 'in wonderland',
      phone: '99 99999-9999',
    });

    expect(customerRepository.customers).toHaveLength(1);
  });

  it('should be able find customer by user id', async () => {
    const date = new Date();
    const user = new User(
      'Customer',
      'customer@email.com',
      'pwd1234',
      date,
      date,
    );
    user.id = 1;
    customerRepository.customers.push(
      new Customer('in wonderland', '99 99999-9999', date, user),
    );
    const customer = await service.findByUserId(1);

    expect(customer).toBeInstanceOf(Customer);
  });

  it('should throw error if cannot found customer by user id', async () => {
    await expect(service.findByUserId(1)).rejects.toThrow();
  });
});
