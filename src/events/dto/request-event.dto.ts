import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';

export class ByEventIdDto {
  @ApiProperty({
    type: 'number',
  })
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  eventId: number;
}
