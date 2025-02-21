/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument*/
import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  Get,
  UnauthorizedException,
} from '@nestjs/common';
import { PartnersService } from './partners.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { EventsService } from 'src/events/events.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateEventDto } from 'src/events/dto/create-event.dto';
import { payloadType } from 'src/auth/auth.service';

@Controller('partners')
export class PartnersController {
  constructor(
    private readonly partnersService: PartnersService,
    private readonly eventsService: EventsService,
  ) {}

  @Post()
  create(@Body() createPartnerDto: CreatePartnerDto) {
    return this.partnersService.create(createPartnerDto);
  }

  @UseGuards(AuthGuard)
  @Post('events')
  createEvents(@Body() createEventDto: CreateEventDto, @Request() req) {
    return this.eventsService.create(createEventDto, req.user as payloadType);
  }

  @UseGuards(AuthGuard)
  @Get('events')
  async findEventAll(@Request() req) {
    const partner = await this.partnersService.findByUserId(req.user.sub);
    if (!partner) {
      throw new UnauthorizedException();
    }
    return this.eventsService.findAll(partner.id);
  }

  @UseGuards(AuthGuard)
  @Get('events/:id')
  async findEventById(@Request() req) {
    const partner = await this.partnersService.findByUserId(req.user.sub);
    if (!partner) {
      throw new UnauthorizedException();
    }
    return this.eventsService.findById(+req.params.id, partner.id);
  }
}
