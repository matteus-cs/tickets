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
import { PurchaseRepository } from '@/repositories/purchase.repository';
import { PurchaseRepositoryAdapter } from './repositories/purchase.repository.adapter';
import { ReservationTicketRepositoryAdapter } from './repositories/reservationTicket.repository.adapter';
import { TicketsModule } from '@/tickets/tickets.module';
import { ReservationTicketRepository } from '@/repositories/reservationTicket.repository';
import { TasksService } from './task.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Purchase, ReservationTicket, Ticket, Customer]),
    PaymentModule,
    CustomersModule,
    TicketsModule,
  ],
  controllers: [PurchasesController],
  providers: [
    PurchasesService,
    TasksService,
    {
      provide: PurchaseRepository,
      useClass: PurchaseRepositoryAdapter,
    },
    {
      provide: ReservationTicketRepository,
      useClass: ReservationTicketRepositoryAdapter,
    },
  ],
})
export class PurchasesModule {}
