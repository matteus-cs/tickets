import { forwardRef, Module } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { CustomersModule } from '@/customers/customers.module';
import { Customer } from '@/customers/entities/customer.entity';
import { ReservationTicketRepository } from '@/repositories/reservationTicket.repository';
import { Ticket } from '@/tickets/entities/ticket.entity';
import { TicketsModule } from '@/tickets/tickets.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationTicket } from './entities/reservationTicket.entity';
import { ReservationTicketRepositoryAdapter } from './repositories/reservationTicket.repository.adapter';
import { TasksService } from './task.service';
import { PurchasesModule } from '@/purchases/purchases.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReservationTicket, Ticket, Customer]),
    CustomersModule,
    TicketsModule,
    forwardRef(() => PurchasesModule),
  ],
  providers: [
    ReservationService,
    TasksService,
    {
      provide: ReservationTicketRepository,
      useClass: ReservationTicketRepositoryAdapter,
    },
  ],
  controllers: [ReservationController],
  exports: [ReservationTicketRepository],
})
export class ReservationModule {}
