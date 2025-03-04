import { EventRepository } from '@/repositories/event.repository';
import { Event } from '../entities/event.entity';
import { DataSource, Repository } from 'typeorm';

export class EventRepositoryAdapter implements EventRepository {
  private eventRepository: Repository<Event>;
  constructor(private readonly dataSource: DataSource) {
    this.eventRepository = dataSource.getRepository(Event);
  }
  async save(event: Event): Promise<void> {
    await this.eventRepository.save(event);
  }
  async findAll(partnerId?: number): Promise<Event[]> {
    if (partnerId)
      await this.eventRepository.findBy({ partner: { id: partnerId } });

    return await this.eventRepository.find();
  }
  async findById(id: number, partnerId?: number): Promise<Event | null> {
    if (partnerId) {
      return await this.eventRepository.findOneBy({
        id,
        partner: { id: partnerId },
      });
    }
    return await this.eventRepository.findOneBy({ id });
  }
}
