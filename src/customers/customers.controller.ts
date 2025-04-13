import { Controller, Post, Body } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { ApiBadRequestResponse, ApiResponse } from '@nestjs/swagger';

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
        message: {
          type: 'string',
          example: 'partner already exists',
        },
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
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }
}
