import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { Partner } from 'src/partners/entities/partner.entity';
import { Event } from 'src/events/entities/event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, Partner, Event])],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
