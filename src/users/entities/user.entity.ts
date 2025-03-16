import { BadRequestException } from '@nestjs/common';
import { compareSync, hashSync } from 'bcrypt';
import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

export type PropsUser = {
  id?: number | null;
  name: string;
  email: string;
  password: string;
  createdAt?: Date | null;
};

@Entity('users')
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  createdAt: Date;

  static create(props: PropsUser) {
    const { password } = props;
    const user = new User();
    user.name = props.name;
    user.email = props.email;
    if (password.length < 8) {
      throw new BadRequestException('password must be 8 characters or more');
    }
    user.password = hashSync(props.password, 10);
    user.createdAt = props.createdAt ?? new Date();
    return user;
  }

  static comparePassword(password: string, hashedPassword: string) {
    return compareSync(password, hashedPassword);
  }
  comparePassword(password: string) {
    return compareSync(password, this.password);
  }
}
