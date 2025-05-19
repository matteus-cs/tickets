import { forwardRef, Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { TicketsModule } from '@/tickets/tickets.module';
import { PurchasesModule } from '@/purchases/purchases.module';
import { BasePaymentService } from '@/payment/basePayment.service';
import { ReservationModule } from '@/reservation/reservation.module';

@Module({
  imports: [
    TicketsModule,
    forwardRef(() => PurchasesModule),
    ReservationModule,
  ],
  providers: [
    StripeService,
    {
      provide: BasePaymentService,
      useClass: StripeService,
    },
  ],
  exports: [BasePaymentService],
})
export class StripeModule {}
