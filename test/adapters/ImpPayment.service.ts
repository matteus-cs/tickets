/* eslint-disable @typescript-eslint/require-await */
import {
  BasePaymentService,
  ClientSecretPayment,
  ParamsConfirmedPayment,
  ParamsProcessPayment,
} from '@/payment/basePayment.service';
import { randomUUID } from 'crypto';

export class ImpPaymentService implements BasePaymentService {
  async processPayment(
    params: ParamsProcessPayment,
  ): Promise<ClientSecretPayment> {
    return { clientSecret: randomUUID() };
  }
  async confirmedPayment(params: ParamsConfirmedPayment): Promise<void> {
    return;
  }
}
