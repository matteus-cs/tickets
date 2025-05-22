import {
  Controller,
  Post,
  Body,
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
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { CustomerRepository } from '@/repositories/customer.repository';
import { ByEventIdDto } from '@/events/dto/request-event.dto';
import {
  CreateTicketHashQueryDto,
  FindEventsQueryDto,
} from './dto/request-tickets.dto';
import { payloadType } from '@/auth/auth.service';
import { User } from '@/decorators/user.decorator';
import { ErrorCode } from '@/error-code';

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
  create(
    @Body() createTicketDto: CreateTicketDto[],
    @User() user: payloadType,
    @Param() params: ByEventIdDto,
  ) {
    return this.ticketsService.create(
      createTicketDto,
      params.eventId,
      user.sub,
    );
  }

  @Get()
  findEvents(
    @Param() params: ByEventIdDto,
    @Query() query: FindEventsQueryDto,
  ) {
    const { page, status } = query;
    return this.ticketsService.findByEventId(params.eventId, page || 1, status);
  }

  @UseGuards(AuthGuard)
  @Get('/hash')
  @ApiBearerAuth()
  @ApiOkResponse({
    schema: { properties: { hash: { type: 'string' } } },
    description: 'hash for event validation',
  })
  @ApiForbiddenResponse({
    schema: {
      properties: {
        code: { type: 'string', example: ErrorCode.AUTH_FORBIDDEN },
      },
    },
    description: 'is not the owner of the ticket',
  })
  @ApiUnprocessableEntityResponse({
    schema: {
      properties: {
        code: { type: 'string', example: ErrorCode.PURCHASE_INVALID_STATE },
      },
    },
    description: 'when ticket not sold or payment not made',
  })
  async createTicketHash(
    @User() user: payloadType,
    @Query() query: CreateTicketHashQueryDto,
  ) {
    const { ticketId, purchaseId } = query;

    const customer = await this.customerRepository.findByUser({
      id: user.sub,
    });
    if (!customer) {
      throw new ForbiddenException({ code: ErrorCode.AUTH_FORBIDDEN });
    }

    return await this.ticketsService.createTicketHash(
      ticketId,
      purchaseId,
      customer.id,
    );
  }
}
