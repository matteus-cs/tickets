import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { payloadType } from '@/auth/auth.service';
import { PartnerRepository } from '@/repositories/partner.repository';
import { EventRepository } from '@/repositories/event.repository';
import { Event } from './entities/event.entity';

@Injectable()
export class EventsService {
  constructor(
    private eventsRepository: EventRepository,

    private partnersRepository: PartnerRepository,
  ) {}
  async create(createEventDto: CreateEventDto, user: payloadType) {
    const { name, description, date, location } = createEventDto;

    const partner = await this.partnersRepository.findByUserId(user.sub);

    if (!partner) {
      throw new UnauthorizedException();
    }

    const event = new Event(
      name,
      description,
      date,
      location,
      new Date(),
      partner,
    );

    await this.eventsRepository.save(event);
  }

  async findAll(partnerId?: number) {
    if (partnerId) {
      return await this.eventsRepository.findAll(partnerId);
    }
    return await this.eventsRepository.findAll();
  }

  async findById(id: number, partnerId?: number) {
    if (partnerId) {
      const partner = await this.eventsRepository.findById(id, partnerId);
      if (!partner) throw new NotFoundException();
      return partner;
    }
    const partner = await this.eventsRepository.findById(id);
    if (!partner) throw new NotFoundException();
    return partner;
  }
}
