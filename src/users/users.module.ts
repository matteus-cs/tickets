import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserRepository } from '@/repositories/user.repository';
import { UserRepositoryAdapter } from './repositories/user.repository.adapter';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [{ provide: UserRepository, useClass: UserRepositoryAdapter }],
  exports: [UserRepository],
})
export class UsersModule {}
