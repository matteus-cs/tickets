import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { QueryFailedError } from 'typeorm';
import { TicketStatusEnum } from '@/tickets/entities/ticket.entity';
import { PurchaseStatusEnum, Purchase } from './entities/purchase.entity';
import { ReservationTicket } from './entities/reservationTicket.entity';
import { PurchaseRepository } from '@/repositories/purchase.repository';
import { CustomerRepository } from '@/repositories/customer.repository';
import { TicketRepository } from '@/repositories/ticket.repository';
import { ReservationTicketRepository } from '@/repositories/reservationTicket.repository';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PurchasesService {
  private stripe: Stripe;
  constructor(
    private customerRepository: CustomerRepository,

    private ticketRepository: TicketRepository,

    private purchaseRepository: PurchaseRepository,

    private reservationTicketRepository: ReservationTicketRepository,

    private configService: ConfigService,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_API_KEY') as string,
    );
  }
  async create(createPurchaseDto: CreatePurchaseDto, customerId: number) {
    const { ticketIds } = createPurchaseDto;
    const customer = await this.customerRepository.findById(customerId, true);
    if (!customer) {
      throw new NotFoundException('customer not found');
    }

    const findAllTicketPromises = ticketIds.map((id) =>
      this.ticketRepository.findById(id),
    );

    const tickets = (await Promise.all(findAllTicketPromises)).filter(
      (t) => t !== null,
    );

    if (tickets.length !== ticketIds.length) {
      throw new NotFoundException('Some tickets not found');
    }
    if (
      tickets.some((ticket) => ticket.status !== TicketStatusEnum.AVAILABLE)
    ) {
      throw new BadRequestException('Some tickets are not available');
    }

    const amount = tickets.reduce((acc, t) => {
      if (t?.price) {
        return acc + Number(t?.price);
      }
    }, 0);

    const purchase = Purchase.create({
      purchaseDate: new Date(),
      totalAmount: amount as number,
      customer,
      tickets,
    });
    const { id: purchaseId } = await this.purchaseRepository.save(purchase);

    const paymentIntents = await this.stripe.paymentIntents.create({
      amount: Math.round((amount as number) * 100),
      currency: 'brl',
      payment_method_types: ['card', 'boleto'],
      metadata: {
        customerId: customer.id.toString(),
        purchaseId: purchaseId.toString(),
        ticketIds: JSON.stringify(ticketIds),
      },
    });

    try {
      await this.reservationTicketRepository.startTransaction();
      const reservations = tickets.map((t) => {
        const reservation = ReservationTicket.create({
          reservationDate: new Date(),
          customer,
          ticket: t,
        });
        return reservation;
      });
      await this.reservationTicketRepository.save(reservations);
      await this.reservationTicketRepository.commitTransaction();
      await this.reservationTicketRepository.release();

      await Promise.all(
        tickets.map((t) => {
          return this.ticketRepository.update(t.id, {
            status: TicketStatusEnum.SOLD,
          });
        }),
      );
    } catch (error) {
      await this.reservationTicketRepository.rollbackTransaction();
      if (error instanceof QueryFailedError) {
        throw new UnprocessableEntityException('ticket no longer available');
      }
      throw error;
    }
    return { clientSecret: paymentIntents.client_secret };
  }

  async confirmPayment(payload: any, signature: string) {
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

        await this.purchaseRepository.update(purchaseId, {
          status: PurchaseStatusEnum.PAID,
        });
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const purchaseId = Number(paymentIntent.metadata.purchaseId);
        const ticketIds: number[] = JSON.parse(
          paymentIntent.metadata.ticketIds,
        );

        await this.purchaseRepository.update(purchaseId, {
          status: PurchaseStatusEnum.ERROR,
        });

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
      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}.`);
    }
  }
}
