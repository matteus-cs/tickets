import { CustomerRepository } from '@/repositories/customer.repository';
import { Customer } from '../entities/customer.entity';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class CustomerRepositoryAdapter implements CustomerRepository {
  constructor(private dataSource: DataSource) {}

  async save(customer: Customer): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      await queryRunner.manager.save(customer.user);
      await queryRunner.manager.save(customer);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  async findByUserId(userId: number): Promise<Customer | null> {
    return await this.dataSource
      .getRepository(Customer)
      .findOneBy({ user: { id: userId } });
  }

  async findById(id: number, user: boolean): Promise<Customer | null> {
    if (user) {
      const customer = await this.dataSource
        .getRepository(Customer)
        .createQueryBuilder('customers')
        .leftJoinAndSelect('customer.user', 'user')
        .where('customer.id = :id', { id })
        .getOne();
      return customer;
    }
    return await this.dataSource.getRepository(Customer).findOneBy({ id });
  }
}
