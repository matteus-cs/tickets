import { User } from '@/users/entities/user.entity';

export abstract class UserRepository {
  abstract findById(id: number): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
}
