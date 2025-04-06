import { forwardRef, Module } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { PurchasesController } from './purchases.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Purchase } from './entities/purchase.entity';
import { ReservationTicket } from './entities/reservationTicket.entity';
import { Ticket } from '@/tickets/entities/ticket.entity';
import { Customer } from '@/customers/entities/customer.entity';
import { CustomersModule } from '@/customers/customers.module';
import { PurchaseRepository } from '@/repositories/purchase.repository';
import { PurchaseRepositoryAdapter } from './repositories/purchase.repository.adapter';
import { ReservationTicketRepositoryAdapter } from './repositories/reservationTicket.repository.adapter';
import { TicketsModule } from '@/tickets/tickets.module';
import { ReservationTicketRepository } from '@/repositories/reservationTicket.repository';
import { TasksService } from './task.service';
import { StripeModule } from '@/stripe/stripe.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Purchase, ReservationTicket, Ticket, Customer]),
    CustomersModule,
    TicketsModule,
    forwardRef(() => StripeModule),
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
  exports: [PurchaseRepository, ReservationTicketRepository],
})
export class PurchasesModule {}
