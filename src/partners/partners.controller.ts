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
import { EventsService } from '@/events/events.service';
import { AuthGuard } from '@/auth/auth.guard';
import { CreateEventDto } from '@/events/dto/create-event.dto';
import { payloadType } from '@/auth/auth.service';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { TicketsService } from '@/tickets/tickets.service';

@Controller('partners')
export class PartnersController {
  constructor(
    private readonly partnersService: PartnersService,
    private readonly eventsService: EventsService,
    private readonly ticketService: TicketsService,
  ) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Successfully created' })
  @ApiResponse({
    status: 400,
    description:
      'When you try to create a partner with an email already registered',
    schema: {
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
  create(@Body() createPartnerDto: CreatePartnerDto) {
    return this.partnersService.create(createPartnerDto);
  }

  @UseGuards(AuthGuard)
  @Post('events')
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Successfully created' })
  @ApiUnauthorizedResponse({ description: 'When a user is not a partner' })
  createEvents(@Body() createEventDto: CreateEventDto, @Request() req) {
    return this.eventsService.create(createEventDto, req.user as payloadType);
  }

  @UseGuards(AuthGuard)
  @Get('events')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'array of partner events',
    schema: {
      type: 'array',
      items: {
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
          description: { type: 'string' },
          date: { type: 'string', format: 'date' },
          location: { type: 'string' },
          createdAt: { type: 'string', format: 'date' },
        },
        required: ['false'],
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'When a user is not a partner' })
  async findEventAll(@Request() req) {
    const partner = await this.partnersService.findByUserId(req.user.sub);
    if (!partner) {
      throw new UnauthorizedException();
    }
    return this.eventsService.findAll(partner.id);
  }

  @UseGuards(AuthGuard)
  @Get('events/:id')
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    schema: { type: 'number', description: 'event id' },
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'a event of partner',
    schema: {
      properties: {
        id: { type: 'number' },
        name: { type: 'string' },
        description: { type: 'string' },
        date: { type: 'string', format: 'date' },
        location: { type: 'string' },
        createdAt: { type: 'string', format: 'date' },
      },
      required: ['false'],
    },
  })
  @ApiUnauthorizedResponse({ description: 'When a user is not a partner' })
  @ApiNotFoundResponse({ description: 'When event not found by passed id' })
  async findEventById(@Request() req) {
    const partner = await this.partnersService.findByUserId(req.user.sub);
    if (!partner) {
      throw new UnauthorizedException();
    }
    return this.eventsService.findById(+req.params.id, partner.id);
  }

  @UseGuards(AuthGuard)
  @Get('events/:id/ticket/validate')
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    schema: { type: 'number', description: 'event id' },
    required: true,
  })
  @ApiQuery({
    name: 'hash',
    schema: { type: 'string', description: 'ticket hash' },
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'verify if ticket is valid',
    schema: {
      properties: {
        isValid: { type: 'bool' },
      },
    },
  })
  async validateTicket(@Request() req) {
    const partner = await this.partnersService.findByUserId(req.user.sub);
    if (!partner) {
      throw new UnauthorizedException();
    }

    const { id } = req.params;
    const { hash } = req.query;
    const isValid = await this.ticketService.validate(
      +req.user.sub,
      +id,
      hash as string,
    );
    return { isValid };
  }
}
