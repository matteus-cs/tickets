import { forwardRef, Module } from '@nestjs/common';
import { PartnersService } from './partners.service';
import { PartnersController } from './partners.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Partner } from './entities/partner.entity';
import { User } from '@/users/entities/user.entity';
import { Event } from '@/events/entities/event.entity';
import { EventsModule } from '@/events/events.module';
import { PartnerRepository } from '@/repositories/partner.repository';
import { PartnerRepositoryAdapter } from './partner.repository.adapter';

@Module({
  imports: [
    TypeOrmModule.forFeature([Partner, User, Event]),
    forwardRef(() => EventsModule),
  ],
  controllers: [PartnersController],
  providers: [
    PartnersService,
    {
      provide: PartnerRepository,
      useClass: PartnerRepositoryAdapter,
    },
  ],
  exports: [PartnerRepository],
})
export class PartnersModule {}
