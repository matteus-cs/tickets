import {
  Controller,
  Post,
  Body,
  UseGuards,
  UnauthorizedException,
  Req,
} from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { AuthGuard } from '@/auth/auth.guard';
import { CustomersService } from '@/customers/customers.service';
import { Request } from 'express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

@Controller('purchases')
export class PurchasesController {
  constructor(
    private readonly purchasesService: PurchasesService,
    private readonly customerService: CustomersService,
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
  async create(@Body() createPurchaseDto: CreatePurchaseDto, @Req() req) {
    const customer = await this.customerService.findByUserId(req.user.sub);
    if (!customer) {
      throw new UnauthorizedException('User needs be a customer');
    }
    return this.purchasesService.create(createPurchaseDto, customer.id);
  }

  @Post('confirmed-payment/webhook')
  async confirmedPayment(@Req() req: Request) {
    const event = req.body;
    const signature = req.headers['stripe-signature'] as string;

    await this.purchasesService.confirmPayment(event, signature);
  }
}
