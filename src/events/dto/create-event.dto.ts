import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEventDto {
  @ApiProperty({
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({
    type: 'string',
    format: 'date',
  })
  //@IsDate()
  @IsNotEmpty()
  date: Date;

  @ApiProperty({
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  location: string;
}
