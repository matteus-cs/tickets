/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('events/:eventId/tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createTicketDto: CreateTicketDto[], @Request() req) {
    return this.ticketsService.create(
      createTicketDto,
      req.params.eventId,
      +req.user.sub,
    );
  }
}
