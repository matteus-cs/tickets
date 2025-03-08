import { UserRepository } from '@/repositories/user.repository';
import { User } from '../entities/user.entity';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRepositoryAdapter implements UserRepository {
  constructor(private dataSource: DataSource) {}
  async findById(id: number): Promise<User | null> {
    return await this.dataSource.manager.findOneBy(User, { id });
  }
  async findByEmail(email: string): Promise<User | null> {
    return await this.dataSource.manager.findOneBy(User, { email });
  }
}
