import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { AuthGuard } from '@/auth/auth.guard';
import {
  ApiBody,
  ApiQuery,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { TicketStatusEnum } from './entities/ticket.entity';

@Controller('events/:eventId/tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @UseGuards(AuthGuard)
  @Post()
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
}
