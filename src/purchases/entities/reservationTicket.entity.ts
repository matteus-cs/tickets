import { Customer } from '@/customers/entities/customer.entity';
import { Ticket } from '@/tickets/entities/ticket.entity';

import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  Unique,
} from 'typeorm';

export type ReservationTicketProps = {
  id?: number | null;
  reservationDate?: Date | null;
  status?: ReservationTicketStatusEnum | null;
  ticket?: Partial<Ticket> | null;
  customer?: Partial<Customer> | null;
};

export enum ReservationTicketStatusEnum {
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
    enum: ReservationTicketStatusEnum,
    default: ReservationTicketStatusEnum.RESERVED,
  })
  status: ReservationTicketStatusEnum;

  @Column({
    asExpression: "CASE WHEN status = 'reserved' THEN ticketId ELSE NULL END",
    generatedType: 'VIRTUAL',
  })
  reservedTicketId: number;

  @ManyToOne(() => Ticket, (ticket) => ticket.reservations, { eager: true })
  ticket: Relation<Ticket>;

  @ManyToOne(() => Customer, (customer) => customer.reservations, {
    eager: true,
  })
  customer: Relation<Customer>;

  static create(props: ReservationTicketProps) {
    const reservationTicket = new ReservationTicket();

    reservationTicket.reservationDate = props.reservationDate ?? new Date();
    reservationTicket.status =
      props.status ?? ReservationTicketStatusEnum.RESERVED;

    if (props.ticket) {
      const ticket = new Ticket();
      Object.assign(ticket, props.ticket);
      reservationTicket.ticket = ticket;
    }
    if (props.customer) {
      const customer = new Customer();
      Object.assign(customer, props.customer);
      reservationTicket.customer = customer;
    }
    return reservationTicket;
  }
}
