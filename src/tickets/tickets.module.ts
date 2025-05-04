import { forwardRef, Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { Partner } from 'src/partners/entities/partner.entity';
import { Event } from 'src/events/entities/event.entity';
import { TicketRepository } from '@/repositories/ticket.repository';
import { TicketRepositoryAdapter } from './repositories/ticket.repository.adapter';
import { PartnersModule } from '@/partners/partners.module';
import { Cryptography } from './utils/cryptography';
import { CustomersModule } from '@/customers/customers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, Partner, Event]),
    forwardRef(() => PartnersModule),
    forwardRef(() => CustomersModule),
  ],
  controllers: [TicketsController],
  providers: [
    TicketsService,
    { provide: TicketRepository, useClass: TicketRepositoryAdapter },
    Cryptography,
  ],
  exports: [TicketRepository, TicketsService],
})
export class TicketsModule {}
