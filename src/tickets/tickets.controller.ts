import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  Get,
  Param,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { AuthGuard } from '@/auth/auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { TicketStatusEnum } from './entities/ticket.entity';
import { CustomerRepository } from '@/repositories/customer.repository';

@Controller('events/:eventId/tickets')
export class TicketsController {
  constructor(
    private readonly ticketsService: TicketsService,
    private readonly customerRepository: CustomerRepository,
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiBody({ type: [CreateTicketDto] })
  @ApiResponse({ status: 201, description: 'Successfully created' })
  @ApiUnauthorizedResponse({ description: 'When a user is not a partner' })
  create(@Body() createTicketDto: CreateTicketDto[], @Request() req) {
    return this.ticketsService.create(
      createTicketDto,
      req.params.eventId,
      +req.user.sub,
    );
  }

  @Get()
  @ApiQuery({ name: 'page', schema: { type: 'number' }, required: false })
  @ApiQuery({
    name: 'status',
    schema: { type: 'string', enum: ['available', 'sold'] },
    required: false,
  })
  findEvents(
    @Param('eventId') eventId: number,
    @Query('page') page: number,
    @Query('status') status: TicketStatusEnum,
  ) {
    return this.ticketsService.findByEventId(eventId, page || 1, status);
  }

  @UseGuards(AuthGuard)
  @Get('/ticket-hash')
  @ApiQuery({
    name: 'ticketId',
    schema: { type: 'number' },
    required: true,
  })
  @ApiQuery({
    name: 'purchaseId',
    schema: { type: 'number' },
    required: true,
  })
  async createTicketHash(@Request() req) {
    const { ticketId, purchaseId } = req.query;

    const customer = await this.customerRepository.findByUser({
      id: +req.user.sub,
    });
    if (!customer) {
      throw new ForbiddenException();
    }

    return await this.ticketsService.createTicketHash(
      +ticketId,
      +purchaseId,
      customer.id,
    );
  }
}
