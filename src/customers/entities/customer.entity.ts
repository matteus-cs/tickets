import { User } from 'src/users/entities/user.entity';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
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
  user: User;
}
