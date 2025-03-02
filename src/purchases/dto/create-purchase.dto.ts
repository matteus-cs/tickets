/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreatePurchaseDto {
  @IsArray()
  @IsNotEmpty()
  ticketIds: number[];

  @IsString()
  @IsNotEmpty()
  cardToken: string;
}
