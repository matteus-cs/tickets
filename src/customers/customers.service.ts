import { Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { Customer } from './entities/customer.entity';
import { User } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,

    private dataSource: DataSource,
  ) {}
  async create(createCustomerDto: CreateCustomerDto): Promise<void> {
    const { name, email, password, address, phone } = createCustomerDto;
    const createdAt = new Date();
    const user = this.userRepository.create({
      name,
      email,
      password,
      updatedAt: createdAt,
      createdAt,
    });
    const customer = this.customerRepository.create({
      address,
      phone,
      createdAt,
      user,
    });
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.dataSource.manager.save(user);
      await this.dataSource.manager.save(customer);
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
