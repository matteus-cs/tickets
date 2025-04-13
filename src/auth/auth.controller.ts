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

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOkResponse({
    schema: { properties: { accessToken: { type: 'string' } } },
  })
  @ApiUnauthorizedResponse({ description: 'incorrect e-mail or password' })
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
