import {
  Body,
  Controller,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@/auth/auth.guard';
import { CustomersService } from '@/customers/customers.service';
import { Request } from 'express';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Controller('reservation')
export class ReservationController {
  constructor(
    private reservationService: ReservationService,
    private customersService: CustomersService,
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiCreatedResponse({
    schema: { properties: { clientSecret: { type: 'string' } } },
  })
  @ApiNotFoundResponse({
    schema: {
      properties: {
        message: { type: 'string', example: 'Some tickets not found' },
        error: {
          type: 'string',
          example: 'Not Found',
        },
        statusCode: {
          type: 'string',
          example: 404,
        },
      },
    },
  })
  @ApiBadRequestResponse({
    schema: {
      properties: {
        message: { type: 'string', example: 'Some tickets are not available' },
        error: {
          type: 'string',
          example: 'Bad Request',
        },
        statusCode: {
          type: 'string',
          example: 400,
        },
      },
    },
  })
  async create(
    @Body() createReservationDto: CreateReservationDto,
    @Req() req: Request,
  ) {
    const customer = await this.customersService.findByUserId(req.user!.sub);
    if (!customer) {
      throw new UnauthorizedException('User needs be a customer');
    }
    return this.reservationService.create(createReservationDto, customer.id);
  }
}
