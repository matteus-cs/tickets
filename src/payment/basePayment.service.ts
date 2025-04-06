export type ClientSecretPayment = {
  clientSecret: string;
};

export type ParamsProcessPayment = {
  amount: number;
  metadata: {
    customerId: number;
    purchaseId: number;
    ticketIds: number[];
  };
};

export type ParamsConfirmedPayment = {
  payload: any;
  signature: string;
};

export abstract class BasePaymentService {
  abstract processPayment(
    params: ParamsProcessPayment,
  ): Promise<ClientSecretPayment>;
  abstract confirmedPayment(params: ParamsConfirmedPayment): Promise<void>;
}
