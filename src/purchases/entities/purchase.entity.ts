import { Customer } from 'src/customers/entities/customer.entity';
import { Ticket } from 'src/tickets/entities/ticket.entity';
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
}
