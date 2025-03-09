import { User } from '@/users/entities/user.entity';
import { Event } from '@/events/entities/event.entity';

import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity('partners')
export class Partner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  companyName: string;

  @Column()
  createdAt: Date;

  @OneToOne(() => User)
  @JoinColumn()
  user: Relation<User>;

  @OneToMany(() => Event, (event) => event.partner, { cascade: true })
  events: Relation<Event[]>;

  constructor(companyName: string, createdAt: Date, user: User) {
    this.companyName = companyName;
    this.createdAt = createdAt;
    this.user = user;
  }
}
