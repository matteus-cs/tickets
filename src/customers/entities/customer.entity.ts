import { Purchase } from '@/purchases/entities/purchase.entity';
import { ReservationTicket } from '@/purchases/entities/reservationTicket.entity';
import { User } from '@/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

export type CustomerProps = {
  id?: number | null;
  address: string;
  phone: string;
  createdAt?: Date | null;
  user?: Partial<User> | User | null;
};

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address: string;

  @Column()
  phone: string;

  @Column()
  createdAt: Date;

  @OneToOne(() => User)
  @JoinColumn()
  user: Relation<User>;

  @OneToMany(() => ReservationTicket, (r) => r.customer)
  reservations: Relation<ReservationTicket[]>;

  @OneToMany(() => Purchase, (purchase) => purchase.customer)
  purchases: Relation<Purchase[]>;

  static create(props: CustomerProps): Customer {
    const customer = new Customer();
    customer.address = props.address;
    customer.phone = props.phone;
    customer.createdAt = customer.createdAt ?? new Date();

    if (props.user) {
      if (props.user instanceof User) {
        customer.user = props.user;
      } else {
        const user = new User();
        Object.assign(user, props.user);
        customer.user = user;
      }
    }
    return customer;
  }
}
