import { Customer } from '@/customers/entities/customer.entity';
import { Ticket } from '@/tickets/entities/ticket.entity';
import { forwardRef } from '@nestjs/common';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

export type PurchaseProps = {
  id?: number | null;
  purchaseDate: Date;
  totalAmount: number;
  status?: PurchaseStatusEnum | null;
  customer?: Partial<Customer> | null;
  tickets?: Partial<Ticket>[] | null;
};

export enum PurchaseStatusEnum {
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
    enum: PurchaseStatusEnum,
    default: PurchaseStatusEnum.PENDING,
  })
  status: PurchaseStatusEnum;

  @ManyToOne(() => Customer, (c) => c.purchases)
  customer: Relation<Customer>;

  @ManyToMany(() => forwardRef(() => Ticket).forwardRef, (ticket) => ticket)
  @JoinTable()
  tickets: Relation<Ticket[]>;

  static create(props: PurchaseProps) {
    const purchase = new Purchase();
    Object.assign(purchase, props);
    purchase.status = props.status ?? PurchaseStatusEnum.PENDING;

    if (props.tickets) {
      purchase.tickets = [];
      for (const t of props.tickets) {
        const ticket = new Ticket();
        Object.assign(ticket, t);
        purchase.tickets.push(ticket);
      }
    }

    if (props.customer) {
      const customer = new Customer();
      Object.assign(customer, props.customer);
      purchase.customer = customer;
    }
    return purchase;
  }
}
