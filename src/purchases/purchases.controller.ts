import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { AuthGuard } from '@/auth/auth.guard';
import { CustomersService } from '@/customers/customers.service';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { ErrorCode } from '@/error-code';

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
        code: { type: 'string', example: ErrorCode.RESERVATION_NOT_FOUND },
        message: {
          type: 'string',
          example: 'Some ticket reservations not found',
        },
      },
    },
  })
  @ApiForbiddenResponse({
    description:
      "When a user is not a partner or some tickets don't belong to the customer",
    schema: {
      properties: {
        code: {
          type: 'string',
          example: ErrorCode.AUTH_FORBIDDEN,
        },
      },
    },
  })
  async create(
    @Body() createPurchaseDto: CreatePurchaseDto,
    @Req() req: Request,
  ) {
    const customer = await this.customerService.findByUserId(req.user!.sub);
    if (!customer) {
      throw new ForbiddenException({ code: ErrorCode.AUTH_FORBIDDEN });
    }
    return this.purchasesService.create(createPurchaseDto, customer.id);
  }

  @Post('confirm-payment/webhook')
  async confirmedPayment(@Req() req: Request) {
    const event = req.body;
    const signature = req.headers['stripe-signature'] as string;

    await this.purchasesService.confirmPayment(event, signature);
  }
}
