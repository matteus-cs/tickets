import { Module } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { PurchasesController } from './purchases.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Purchase } from './entities/purchase.entity';
import { ReservationTicket } from './entities/reservationTicket.entity';
import { Ticket } from '@/tickets/entities/ticket.entity';
import { Customer } from '@/customers/entities/customer.entity';
import { PaymentModule } from '@/payment/payment.module';
import { CustomersModule } from '@/customers/customers.module';

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
