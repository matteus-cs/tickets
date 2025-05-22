import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Get,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signInDto';
import { AuthGuard } from './auth.guard';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ErrorCode } from '@/error-code';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: {
      ttl: 60000,
      limit: 3,
    },
  })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOkResponse({
    schema: { properties: { accessToken: { type: 'string' } } },
  })
  @ApiUnauthorizedResponse({
    description: 'incorrect e-mail or password',
    schema: {
      properties: {
        code: {
          type: 'string',
          example: ErrorCode.AUTH_UNAUTHORIZED,
        },
      },
    },
  })
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOkResponse({
    description: "responds with the logged-in user's data",
    schema: {
      properties: {
        sub: { type: 'number' },
        email: { type: 'string' },
        iat: { type: 'number' },
        exp: { type: 'number' },
      },
    },
  })
  getProfile(@Request() req) {
    return req.user;
  }
}
