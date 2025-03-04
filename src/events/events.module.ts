import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { Partner } from '@/partners/entities/partner.entity';
import { EventRepository } from '@/repositories/event.repository';
import { EventRepositoryAdapter } from './repositories/event.repository.adapter';
import { PartnersModule } from '@/partners/partners.module';

@Module({
  imports: [TypeOrmModule.forFeature([Event, Partner]), PartnersModule],
  controllers: [EventsController],
  providers: [
    EventsService,
    {
      provide: EventRepository,
      useClass: EventRepositoryAdapter,
    },
  ],
  exports: [EventsService],
})
export class EventsModule {}
