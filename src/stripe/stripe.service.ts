import {
  BasePaymentService,
  ClientSecretPayment,
  ParamsConfirmedPayment,
  ParamsProcessPayment,
} from '@/payment/basePayment.service';
import { PurchaseStatusEnum } from '@/purchases/entities/purchase.entity';
import { PurchaseRepository } from '@/repositories/purchase.repository';
import { ReservationTicketRepository } from '@/repositories/reservationTicket.repository';
import { TicketRepository } from '@/repositories/ticket.repository';
import { TicketStatusEnum } from '@/tickets/entities/ticket.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService implements BasePaymentService {
  private stripe: Stripe;
  constructor(
    private ticketRepository: TicketRepository,

    private purchaseRepository: PurchaseRepository,

    private reservationTicketRepository: ReservationTicketRepository,
    private configService: ConfigService,
  ) {
    this.stripe = this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_API_KEY') as string,
    );
  }
  async confirmedPayment(params: ParamsConfirmedPayment): Promise<void> {
    const { payload, signature } = params;
    const endpointSecret = this.configService.get<string>(
      'WEBHOOK_SECRET',
    ) as string;
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        endpointSecret,
      );
    } catch (err) {
      console.log(err);
      throw new BadRequestException(
        `Webhook signature verification failed.`,
        err.message,
      );
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const purchaseId = Number(paymentIntent.metadata.purchaseId);

        console.log(purchaseId);

        await this.purchaseRepository.update(
          { id: purchaseId },
          {
            status: PurchaseStatusEnum.PAID,
          },
        );
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const purchaseId = Number(paymentIntent.metadata.purchaseId);
        const ticketIds: number[] = JSON.parse(
          paymentIntent.metadata.ticketIds,
        );

        await this.purchaseRepository.update(
          { id: purchaseId },
          {
            status: PurchaseStatusEnum.ERROR,
          },
        );

        await Promise.all(
          ticketIds.map((id) => {
            return this.reservationTicketRepository.delete({ ticket: { id } });
          }),
        );

        await Promise.all(
          ticketIds.map((id) => {
            return this.ticketRepository.update(id, {
              status: TicketStatusEnum.AVAILABLE,
            });
          }),
        );
        break;
      }

      case 'payment_intent.requires_action': {
        const paymentIntent = event.data.object;
        const ticketIds: number[] = JSON.parse(
          paymentIntent.metadata.ticketIds,
        );
        const expiresAt = paymentIntent.next_action?.boleto_display_details
          ?.expires_at
          ? new Date(
              paymentIntent.next_action?.boleto_display_details.expires_at *
                1000,
            )
          : new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000);
        await Promise.all(
          ticketIds.map((id) => {
            return this.reservationTicketRepository.update(
              { ticket: { id } },
              {
                expiresAt,
              },
            );
          }),
        );
        break;
      }

      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}.`);
    }
  }
  async processPayment(
    params: ParamsProcessPayment,
  ): Promise<ClientSecretPayment> {
    const { amount } = params;
    const { customerId, purchaseId, ticketIds } = params.metadata;
    const paymentIntents = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'brl',
      payment_method_types: ['card', 'boleto'],
      metadata: {
        customerId: customerId.toString(),
        purchaseId: purchaseId.toString(),
        ticketIds: JSON.stringify(ticketIds),
      },
    });
    return { clientSecret: paymentIntents.client_secret as string };
  }
}
