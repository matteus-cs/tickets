import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class CreateReservationDto {
  @ApiProperty({
    type: [Number],
    example: [1, 2, 3],
  })
  @IsArray()
  @IsNotEmpty()
  ticketIds: number[];
}
