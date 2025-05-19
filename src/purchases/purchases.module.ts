import { forwardRef, Module } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { PurchasesController } from './purchases.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Purchase } from './entities/purchase.entity';
import { ReservationTicket } from '@/reservation/entities/reservationTicket.entity';
import { Ticket } from '@/tickets/entities/ticket.entity';
import { Customer } from '@/customers/entities/customer.entity';
import { CustomersModule } from '@/customers/customers.module';
import { PurchaseRepository } from '@/repositories/purchase.repository';
import { PurchaseRepositoryAdapter } from './repositories/purchase.repository.adapter';
import { TicketsModule } from '@/tickets/tickets.module';
import { StripeModule } from '@/stripe/stripe.module';
import { ReservationModule } from '@/reservation/reservation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Purchase, ReservationTicket, Ticket, Customer]),
    CustomersModule,
    TicketsModule,
    forwardRef(() => ReservationModule),
    forwardRef(() => StripeModule),
  ],
  controllers: [PurchasesController],
  providers: [
    PurchasesService,
    {
      provide: PurchaseRepository,
      useClass: PurchaseRepositoryAdapter,
    },
  ],
  exports: [PurchaseRepository],
})
export class PurchasesModule {}
