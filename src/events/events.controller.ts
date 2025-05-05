import { Controller, Get, Param } from '@nestjs/common';
import { EventsService } from './events.service';
import { ApiNotFoundResponse, ApiResponse } from '@nestjs/swagger';
import { ByEventIdDto } from './dto/request-event.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
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
  findAll() {
    return this.eventsService.findAll();
  }

  @Get(':eventId')
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
  @ApiNotFoundResponse({ description: 'When event not found by passed id' })
  findById(@Param() params: ByEventIdDto) {
    return this.eventsService.findById(params.eventId);
  }
}
