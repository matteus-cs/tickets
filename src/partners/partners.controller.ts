import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  Param,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { PartnersService } from './partners.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { EventsService } from '@/events/events.service';
import { AuthGuard } from '@/auth/auth.guard';
import { CreateEventDto } from '@/events/dto/create-event.dto';
import { payloadType } from '@/auth/auth.service';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiResponse,
} from '@nestjs/swagger';
import { TicketsService } from '@/tickets/tickets.service';
import { Request } from 'express';
import { ByEventIdDto } from '@/events/dto/request-event.dto';
import { User } from '@/decorators/user.decorator';
import { ValidateTicketQueryDto } from './dto/request.partner.dto';
import { ErrorCode } from '@/error-code';

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
        code: {
          type: 'string',
          example: ErrorCode.PARTNER_ALREADY_EXIST,
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
  @ApiForbiddenResponse({
    description: 'When a user is not a partner',
    schema: {
      properties: {
        code: {
          type: 'string',
          example: ErrorCode.AUTH_FORBIDDEN,
        },
      },
    },
  })
  createEvents(@Body() createEventDto: CreateEventDto, @Req() req: Request) {
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
  @ApiForbiddenResponse({
    description: 'When a user is not a partner',
    schema: {
      properties: {
        code: {
          type: 'string',
          example: ErrorCode.AUTH_FORBIDDEN,
        },
      },
    },
  })
  async findEventAll(@Req() req: Request) {
    const partner = await this.partnersService.findByUserId(req.user!.sub);
    if (!partner) {
      throw new ForbiddenException({ code: ErrorCode.AUTH_FORBIDDEN });
    }
    return this.eventsService.findAll(partner.id);
  }

  @UseGuards(AuthGuard)
  @Get('events/:eventId')
  @ApiBearerAuth()
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
  @ApiForbiddenResponse({
    description: 'When a user is not a partner',
    schema: {
      properties: {
        code: {
          type: 'string',
          example: ErrorCode.AUTH_FORBIDDEN,
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'When event not found by passed id' })
  async findEventById(
    @User() user: payloadType,
    @Param() params: ByEventIdDto,
  ) {
    const partner = await this.partnersService.findByUserId(user.sub);
    if (!partner) {
      throw new ForbiddenException({ code: ErrorCode.AUTH_FORBIDDEN });
    }

    return this.eventsService.findById(params.eventId, partner.id);
  }

  @UseGuards(AuthGuard)
  @Get('events/:eventId/ticket/validate')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'verify if ticket is valid',
    schema: {
      properties: {
        isValid: { type: 'boolean' },
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'When a user is not a partner',
    schema: {
      properties: {
        code: {
          type: 'string',
          example: ErrorCode.AUTH_FORBIDDEN,
        },
      },
    },
  })
  async validateTicket(
    @User() user: payloadType,
    @Param() params: ByEventIdDto,
    @Query() query: ValidateTicketQueryDto,
  ) {
    const partner = await this.partnersService.findByUserId(user.sub);
    if (!partner) {
      throw new ForbiddenException({ code: ErrorCode.AUTH_FORBIDDEN });
    }

    const isValid = await this.ticketService.validate(
      partner.id,
      params.eventId,
      query.hash,
    );
    return { isValid };
  }
}
