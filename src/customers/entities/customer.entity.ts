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
} from 'typeorm';

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
  user: User;

  @OneToMany(() => ReservationTicket, (r) => r.customer)
  reservations: ReservationTicket[];

  @OneToMany(() => Purchase, (purchase) => purchase.customer)
  purchases: Purchase[];

  constructor(address: string, phone: string, createdAt?: Date, user?: User) {
    this.address = address;
    this.phone = phone;
    this.createdAt = createdAt ?? new Date();
    if (user) {
      this.user = user;
    }
  }
}
