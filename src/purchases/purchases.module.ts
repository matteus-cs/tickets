import { Module } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { PurchasesController } from './purchases.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Purchase } from './entities/purchase.entity';
import { ReservationTicket } from './entities/reservationTicket.entity';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { Customer } from 'src/customers/entities/customer.entity';
import { PaymentModule } from 'src/payment/payment.module';
import { CustomersModule } from 'src/customers/customers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Purchase, ReservationTicket, Ticket, Customer]),
    PaymentModule,
    CustomersModule,
  ],
  controllers: [PurchasesController],
  providers: [PurchasesService],
})
export class PurchasesModule {}
