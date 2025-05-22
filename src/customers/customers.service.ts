import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { Customer } from './entities/customer.entity';
import { User } from '@/users/entities/user.entity';
import { CustomerRepository } from '@/repositories/customer.repository';
import { ErrorCode } from '@/error-code';

@Injectable()
export class CustomersService {
  constructor(private customerRepository: CustomerRepository) {}
  async create(createCustomerDto: CreateCustomerDto): Promise<void> {
    const { name, email, password, address, phone } = createCustomerDto;
    const userAlreadyExists = await this.customerRepository.findByUser({
      email,
    });
    if (userAlreadyExists) {
      throw new BadRequestException({ code: ErrorCode.CUSTOMER_ALREADY_EXIST });
    }
    const date = new Date();
    const user = User.create({ name, email, password, createdAt: date });

    const customer = Customer.create({ address, phone, createdAt: date, user });

    await this.customerRepository.save(customer);
  }

  async findByUserId(userId: number) {
    const customer = await this.customerRepository.findByUser({ id: userId });
    if (!customer) {
      throw new NotFoundException({ code: ErrorCode.CUSTOMER_NOT_FOUND });
    }
    return customer;
  }
}
