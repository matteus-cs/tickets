/* eslint-disable @typescript-eslint/require-await */
import { UserRepository } from '@/repositories/user.repository';
import { User } from '../entities/user.entity';

export class InMemoryUserRepository implements UserRepository {
  public users: User[] = [];
  async findById(id: number): Promise<User | null> {
    return this.users.find((u) => u.id === id) ?? null;
  }
  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((u) => u.email === email) ?? null;
  }
}
