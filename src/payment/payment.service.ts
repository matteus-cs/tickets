/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentService {
  processPayment(
    customer: {
      name: string;
      email: string;
      address: string;
      phone: string;
    },
    amount: number,
    cardToken: string,
  ): number {
    return Math.random();
  }
}
