import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTicketDto {
  @ApiProperty({
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({
    type: 'string',
  })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    type: 'number',
    required: false,
  })
  @IsString()
  @IsOptional()
  quantity?: number;
}
