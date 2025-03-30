import { IsArray, IsNotEmpty } from 'class-validator';

export class CreatePurchaseDto {
  @IsArray()
  @IsNotEmpty()
  ticketIds: number[];
}
