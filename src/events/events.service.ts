import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { payloadType } from 'src/auth/auth.service';
import { Partner } from 'src/partners/entities/partner.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,

    @InjectRepository(Partner)
    private partnersRepository: Repository<Partner>,
  ) {}
  async create(createEventDto: CreateEventDto, user: payloadType) {
    const { name, description, date, location } = createEventDto;

    const partner = await this.partnersRepository.findOne({
      where: { user: { id: user.sub } },
    });

    if (!partner) {
      throw new UnauthorizedException();
    }

    const event = this.eventsRepository.create({
      name,
      description,
      date,
      location,
      createdAt: new Date(),
      partner,
    });

    await this.eventsRepository.save(event);
  }

  async findAll(partnerId?: number) {
    if (partnerId) {
      const partners = await this.eventsRepository.find({
        where: { partner: { id: partnerId } },
      });
      return partners;
    }
    const partners = await this.eventsRepository.find();
    return partners;
  }

  async findById(id: number, partnerId?: number) {
    if (partnerId) {
      const partners = await this.eventsRepository.findOne({
        where: {
          id,
          partner: { id: partnerId },
        },
      });
      return partners;
    }
    const partners = await this.eventsRepository.findOneBy({ id });
    return partners;
  }
}
