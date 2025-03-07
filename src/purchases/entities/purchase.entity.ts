import { Customer } from '@/customers/entities/customer.entity';
import { Ticket } from '@/tickets/entities/ticket.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum EPurchaseStatus {
  PENDING = 'pending',
  PAID = 'paid',
  ERROR = 'error',
  CANCELLED = 'cancelled',
}

@Entity('purchases')
export class Purchase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  purchaseDate: Date;

  @Column({ type: 'decimal', precision: 10.4 })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: EPurchaseStatus,
    default: EPurchaseStatus.PENDING,
  })
  status: EPurchaseStatus;

  @ManyToOne(() => Customer, (c) => c.purchases)
  customer: Customer;

  @ManyToMany(() => Ticket, (ticket) => ticket)
  @JoinTable()
  tickets: Ticket[];

  constructor(
    purchaseDate: Date,
    totalAmount: number,
    status?: EPurchaseStatus,
    customer?: Customer,
    tickets?: Ticket[],
  ) {
    this.purchaseDate = purchaseDate;
    this.totalAmount = totalAmount;
    this.status = status ?? EPurchaseStatus.PENDING;
    if (customer) {
      this.customer = customer;
    }
    if (tickets && tickets.length > 0) {
      this.tickets = tickets;
    }
  }
}
