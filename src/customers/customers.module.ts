import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { User } from '@/users/entities/user.entity';
import { CustomerRepository } from '@/repositories/customer.repository';
import { CustomerRepositoryAdapter } from './repositories/customer.repository.adapter';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, User])],
  controllers: [CustomersController],
  providers: [
    CustomersService,
    {
      provide: CustomerRepository,
      useClass: CustomerRepositoryAdapter,
    },
  ],
  exports: [CustomersService],
})
export class CustomersModule {}
