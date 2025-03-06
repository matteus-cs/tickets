import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { Customer } from './entities/customer.entity';
import { User } from '@/users/entities/user.entity';
import { hashSync } from 'bcrypt';
import { CustomerRepository } from '@/repositories/customer.repository';

@Injectable()
export class CustomersService {
  constructor(private customerRepository: CustomerRepository) {}
  async create(createCustomerDto: CreateCustomerDto): Promise<void> {
    const { name, email, password, address, phone } = createCustomerDto;
    const date = new Date();
    const hashedPassword = hashSync(password, 10);
    const user = new User(name, email, hashedPassword, date, date);

    const customer = new Customer(address, phone, date, user);

    await this.customerRepository.save(customer);
  }

  async findByUserId(userId: number) {
    const customer = await this.customerRepository.findByUserId(userId);
    if (!customer) {
      throw new NotFoundException();
    }
    return customer;
  }
}
