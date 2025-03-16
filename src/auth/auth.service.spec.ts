import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { InMemoryUserRepository } from '../../test/repositories/inMemoryUser.repository';
import { UserRepository } from '@/repositories/user.repository';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { User } from '@/users/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: InMemoryUserRepository;
  let user: User;

  beforeEach(async () => {
    userRepository = new InMemoryUserRepository();
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          global: true,
          secret: jwtConstants.secret,
          signOptions: { expiresIn: '1d' },
        }),
      ],
      providers: [
        AuthService,
        { provide: UserRepository, useValue: userRepository },
      ],
    }).compile();
    const date = new Date();
    user = User.create({
      name: 'john',
      email: 'john@email.com',
      password: 'pwd12345',
      createdAt: date,
    });
    userRepository.users.push(user);
    service = module.get<AuthService>(AuthService);
  });

  it('should be able sing in', async () => {
    jest.spyOn(User, 'comparePassword').mockReturnValue(true);
    const { access_token } = await service.signIn('john@email.com', 'pdw1234');
    expect(access_token).toBeTruthy();
  });

  it('should throw unauthorized error if cannot found user', async () => {
    await expect(
      service.signIn('john2@email.com', 'pdw1234'),
    ).rejects.toThrow();
  });
  it('should throw unauthorized error if password incorrect', async () => {
    jest.spyOn(User, 'comparePassword').mockReturnValue(false);
    await expect(service.signIn('john@email.com', 'pdw1235')).rejects.toThrow();
  });
});
