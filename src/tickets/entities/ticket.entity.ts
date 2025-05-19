import { Event } from '@/events/entities/event.entity';
import { Purchase } from '@/purchases/entities/purchase.entity';
import { ReservationTicket } from '@/reservation/entities/reservationTicket.entity';
import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';

export enum TicketStatusEnum {
  AVAILABLE = 'available',
  SOLD = 'sold',
  RESERVED = 'reserved',
}

export type TicketProps = {
  id?: number | null;
  location: string;
  price: number;
  status?: TicketStatusEnum;
  createdAt?: Date | null;
  event?: Partial<Event> | null;
};

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  location: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({
    type: 'enum',
    enum: TicketStatusEnum,
    default: TicketStatusEnum.AVAILABLE,
  })
  status: TicketStatusEnum;

  @Column()
  createdAt: Date;

  @ManyToOne(() => Event, (event) => event.tickets)
  event: Relation<Event>;

  @OneToMany(() => ReservationTicket, (r) => r.ticket)
  reservations: Relation<ReservationTicket[]>;

  @ManyToMany(() => Purchase, (p) => p.tickets)
  purchases: Relation<Purchase[]>;

  static create(props: TicketProps) {
    const ticket = new Ticket();
    ticket.location = props.location;
    ticket.price = props.price;
    ticket.status = props.status ?? TicketStatusEnum.AVAILABLE;
    ticket.createdAt = props.createdAt ?? new Date();
    if (props.event) {
      const event = new Event();
      Object.assign(event, props.event);
      ticket.event = event;
    }
    return ticket;
  }
}
