import { forwardRef, Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { User } from '@/users/entities/user.entity';
import { CustomerRepository } from '@/repositories/customer.repository';
import { CustomerRepositoryAdapter } from './repositories/customer.repository.adapter';
import { TicketsModule } from '@/tickets/tickets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer, User]),
    forwardRef(() => TicketsModule),
  ],
  controllers: [CustomersController],
  providers: [
    CustomersService,
    {
      provide: CustomerRepository,
      useClass: CustomerRepositoryAdapter,
    },
  ],
  exports: [CustomersService, CustomerRepository],
})
export class CustomersModule {}
