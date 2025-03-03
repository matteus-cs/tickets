import { Partner } from '@/partners/entities/partner.entity';
import { Ticket } from '@/tickets/entities/ticket.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  date: Date;

  @Column()
  location: string;

  @Column()
  createdAt: Date;

  @ManyToOne(() => Partner, (partner) => partner.events)
  partner: Partner;

  @OneToMany(() => Ticket, (ticket) => ticket.event)
  tickets: Ticket[];
}
