import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    type: 'string',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;
}
