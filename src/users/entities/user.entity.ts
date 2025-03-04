import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

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
  updatedAt: Date;

  @Column()
  createdAt: Date;

  constructor(
    name: string,
    email: string,
    password: string,
    updatedAt: Date,
    createdAt: Date,
  ) {
    this.name = name;
    this.email = email;
    this.password = password;
    this.updatedAt = updatedAt;
    this.createdAt = createdAt;
  }
}
