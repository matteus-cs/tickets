import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '@/repositories/user.repository';
import { User } from '@/users/entities/user.entity';
import { ErrorCode } from '@/error-code';

export type payloadType = {
  sub: number;
  email: string;
};

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  async signIn(
    email: string,
    password: string,
  ): Promise<{ accessToken: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException({ code: ErrorCode.AUTH_UNAUTHORIZED });
    }
    const isMatchedPass = User.comparePassword(password, user.password);
    if (!isMatchedPass) {
      throw new UnauthorizedException({ code: ErrorCode.AUTH_UNAUTHORIZED });
    }
    const payload: payloadType = { sub: user.id, email: user.email };
    return { accessToken: await this.jwtService.signAsync(payload) };
  }
}
