import { Event } from 'src/events/entities/event.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

export enum TicketStatusEnum {
  AVAILABLE = 'available',
  SOLD = 'sold',
}

@Entity()
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  location: string;

  @Column({ type: 'decimal' })
  price: number;

  @Column({
    type: 'enum',
    enum: TicketStatusEnum,
    default: TicketStatusEnum.AVAILABLE,
  })
  status: string;

  @Column()
  createdAt: Date;

  @ManyToOne(() => Event, (event) => event.tickets)
  event: Event;
}
