import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { AuthGuard } from '@/auth/auth.guard';
import { ApiBody, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

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
}
