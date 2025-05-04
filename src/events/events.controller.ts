import { Controller, Get, Param } from '@nestjs/common';
import { EventsService } from './events.service';
import { ApiNotFoundResponse, ApiParam, ApiResponse } from '@nestjs/swagger';

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

  @Get(':id')
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
  @ApiNotFoundResponse({ description: 'When event not found by passed id' })
  findById(@Param('id') id: string) {
    return this.eventsService.findById(+id);
  }
}
