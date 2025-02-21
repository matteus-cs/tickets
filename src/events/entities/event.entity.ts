import { Partner } from 'src/partners/entities/partner.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  date: Date;

  @Column()
  location: string;

  @Column()
  createdAt: Date;

  @ManyToOne(() => Partner, (partner) => partner.events)
  partner: Partner;
}
