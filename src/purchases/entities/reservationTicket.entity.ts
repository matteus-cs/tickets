import { Customer } from 'src/customers/entities/customer.entity';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

export enum EReservationTicketStatus {
  RESERVED = 'reserved',
  CANCELLED = 'cancelled',
}

@Entity('reservation_tickets')
@Unique(['reservedTicketId'])
export class ReservationTicket {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'timestamp' })
  reservationDate: Date;

  @Column({
    type: 'enum',
    enum: ['reserved', 'cancelled'],
    default: EReservationTicketStatus.RESERVED,
  })
  status: EReservationTicketStatus;

  @Column({
    asExpression: "CASE WHEN status = 'reserved' THEN ticketId ELSE NULL END",
    generatedType: 'VIRTUAL',
  })
  reservedTicketId: number;

  @ManyToOne(() => Ticket, (ticket) => ticket.reservations, { eager: true })
  ticket: Ticket;

  @ManyToOne(() => Customer, (customer) => customer.reservations, {
    eager: true,
  })
  customer: Customer;
}
