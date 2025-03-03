import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { AuthGuard } from '@/auth/auth.guard';
import { CustomersService } from '@/customers/customers.service';

@Controller('purchases')
export class PurchasesController {
  constructor(
    private readonly purchasesService: PurchasesService,
    private readonly customerService: CustomersService,
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() createPurchaseDto: CreatePurchaseDto, @Request() req) {
    const customer = await this.customerService.findByUserId(req.user.sub);
    if (!customer) {
      throw new UnauthorizedException('User needs be a customer');
    }
    return this.purchasesService.create(createPurchaseDto, customer.id);
  }
}
