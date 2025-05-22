import { Controller, Post, Body } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { ApiBadRequestResponse, ApiResponse } from '@nestjs/swagger';
import { ErrorCode } from '@/error-code';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Successfully created' })
  @ApiBadRequestResponse({
    schema: {
      description:
        'When you try to create a partner with an email already registered',
      properties: {
        code: {
          type: 'string',
          example: ErrorCode.CUSTOMER_ALREADY_EXIST,
        },
      },
    },
  })
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }
}
