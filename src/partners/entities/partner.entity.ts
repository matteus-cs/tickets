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

export type PartnerProps = {
  id?: number | null;
  companyName: string;
  createdAt?: Date;
  user?: Partial<User> | User | null;
};

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

  static create(props: PartnerProps): Partner {
    const partner = new Partner();
    partner.companyName = props.companyName;
    partner.createdAt = props.createdAt ?? new Date();
    if (props.user) {
      if (props.user instanceof User) {
        partner.user = props.user;
      } else {
        const user = new User();
        Object.assign(user, props.user);
        partner.user = user;
      }
    }
    return partner;
  }
}
