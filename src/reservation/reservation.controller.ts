import {
  Body,
  Controller,
  ForbiddenException,
  Post,
  Req,
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
import { ErrorCode } from '@/error-code';

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
        code: { type: 'string', example: ErrorCode.TICKET_NOT_FOUND },
        message: { type: 'string', example: 'Some tickets not found' },
      },
    },
  })
  @ApiBadRequestResponse({
    schema: {
      properties: {
        code: { type: 'string', example: ErrorCode.TICKET_NOT_AVAILABLE },
        message: { type: 'string', example: 'Some tickets are not available' },
      },
    },
  })
  async create(
    @Body() createReservationDto: CreateReservationDto,
    @Req() req: Request,
  ) {
    const customer = await this.customersService.findByUserId(req.user!.sub);
    if (!customer) {
      throw new ForbiddenException({ code: ErrorCode.AUTH_FORBIDDEN });
    }
    return this.reservationService.create(createReservationDto, customer.id);
  }
}
