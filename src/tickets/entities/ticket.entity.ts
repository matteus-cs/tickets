import { Event } from 'src/events/entities/event.entity';
import { Purchase } from 'src/purchases/entities/purchase.entity';
import { ReservationTicket } from 'src/purchases/entities/reservationTicket.entity';
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

  @OneToMany(() => ReservationTicket, (r) => r.ticket)
  reservations: ReservationTicket[];

  @ManyToMany(() => Purchase, (p) => p.tickets)
  purchases: Purchase[];
}
