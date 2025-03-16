import { Partner } from '@/partners/entities/partner.entity';
import { Ticket } from '@/tickets/entities/ticket.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

export type EventProps = {
  id?: number | null;
  name: string;
  description: string;
  date: Date;
  location: string;
  createdAt?: Date | null;
  partner?: Partial<Partner>;
  tickets?: Partial<Ticket>[];
};

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
  partner: Relation<Partner>;

  @OneToMany(() => Ticket, (ticket) => ticket.event)
  tickets: Relation<Ticket[]>;

  static create(props: EventProps) {
    const event = new Event();
    event.name = props.name;
    event.description = props.description;
    event.date = props.date;
    event.location = props.location;
    event.createdAt = props.createdAt ?? new Date();
    if (props.partner) {
      const partner = new Partner();
      Object.assign(partner, props.partner);
      event.partner = partner;
    }
    if (props.tickets) {
      event.tickets = [];
      for (const t of props.tickets) {
        const ticket = new Ticket();
        Object.assign(ticket, t);
        event.tickets.push(ticket);
      }
    }
    return event;
  }
}
