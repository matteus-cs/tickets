import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { TicketStatusEnum } from '../entities/ticket.entity';

export class FindEventsQueryDto {
  @ApiProperty({
    type: 'number',
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Type(() => Number)
  page: number = 1;

  @ApiProperty({
    type: 'string',
    enum: TicketStatusEnum,
  })
  @IsString()
  @IsNotEmpty()
  status: TicketStatusEnum;
}
export class CreateTicketHashQueryDto {
  @ApiProperty({
    type: 'number',
  })
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  ticketId: number;

  @ApiProperty({
    type: 'number',
  })
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  purchaseId: number;
}
