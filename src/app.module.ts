import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { PartnersModule } from './partners/partners.module';
import { Partner } from './partners/entities/partner.entity';
import { CustomersModule } from './customers/customers.module';
import { Customer } from './customers/entities/customer.entity';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { Event } from './events/entities/event.entity';
import { TicketsModule } from './tickets/tickets.module';
import { Ticket } from './tickets/entities/ticket.entity';
import { PurchasesModule } from './purchases/purchases.module';
import { Purchase } from './purchases/entities/purchase.entity';
import { ReservationTicket } from './purchases/entities/reservationTicket.entity';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 33060,
      username: 'root',
      password: 'root',
      database: 'tickets',
      entities: [
        User,
        Partner,
        Customer,
        Event,
        Ticket,
        Purchase,
        ReservationTicket,
      ],
      synchronize: true,
    }),
    UsersModule,
    PartnersModule,
    CustomersModule,
    AuthModule,
    EventsModule,
    TicketsModule,
    PurchasesModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
