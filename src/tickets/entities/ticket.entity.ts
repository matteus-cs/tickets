import { Event } from '@/events/entities/event.entity';
import { Purchase } from '@/purchases/entities/purchase.entity';
import { ReservationTicket } from '@/purchases/entities/reservationTicket.entity';
import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum TicketStatusEnum {
  AVAILABLE = 'available',
  SOLD = 'sold',
}

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
  status: string;

  @Column()
  createdAt: Date;

  @ManyToOne(() => Event, (event) => event.tickets)
  event: Event;

  @OneToMany(() => ReservationTicket, (r) => r.ticket)
  reservations: ReservationTicket[];

  @ManyToMany(() => Purchase, (p) => p.tickets)
  purchases: Purchase[];

  static create(
    location: string,
    price: number,
    status?: TicketStatusEnum,
    createdAt?: Date,
    event?: Partial<Event>,
  ) {
    const ticket = new Ticket();
    ticket.location = location;
    ticket.price = price;
    ticket.status = status ?? TicketStatusEnum.AVAILABLE;
    ticket.createdAt = createdAt ?? new Date();
    let iEvent: Event;
    if (event && Object.keys(event).length > 0) {
      iEvent = new Event();
      for (const e in event) {
        iEvent[e] = event[e];
      }
      ticket.event = iEvent;
    }
    return ticket;
  }
}
