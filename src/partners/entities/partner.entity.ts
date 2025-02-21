import { User } from 'src/users/entities/user.entity';
import { Event } from 'src/events/entities/event.entity';

import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Partner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  companyName: string;

  @Column()
  createdAt: Date;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @OneToMany(() => Event, (event) => event.partner, { cascade: true })
  events: Event[];
}
