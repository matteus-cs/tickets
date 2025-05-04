//#region [imports]
import { TicketsService } from './tickets.service';
import { InMemoryTicketRepository } from '../../test/repositories/inMemory.ticket.repository';
import { InMemoryPartnerRepository } from '../../test/repositories/inMemoryPartner.repository';
import { Partner } from '@/partners/entities/partner.entity';
import { User } from '@/users/entities/user.entity';
import { Ticket, TicketStatusEnum } from './entities/ticket.entity';
import { Cryptography } from './utils/cryptography';
import { ConfigModule } from '@nestjs/config';
import {
  Purchase,
  PurchaseStatusEnum,
} from '@/purchases/entities/purchase.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { TicketRepository } from '@/repositories/ticket.repository';
import { PartnerRepository } from '@/repositories/partner.repository';
import { InMemoryCustomerRepository } from '../../test/repositories/inMemoryCustomer.repository';
import { CustomerRepository } from '@/repositories/customer.repository';
import { Customer } from '@/customers/entities/customer.entity';
import { ForbiddenException } from '@nestjs/common';

//#endregion [imports]

describe('TicketsService', () => {
  //#region [setup test]
  let service: TicketsService;
  let ticketRepository: InMemoryTicketRepository;
  let partnerRepository: InMemoryPartnerRepository;
  let customerRepository: InMemoryCustomerRepository;
  let user: User;
  let partner: Partner;
  let customer: Customer;
  let cryptography: Cryptography;

  beforeEach(async () => {
    ticketRepository = new InMemoryTicketRepository();
    partnerRepository = new InMemoryPartnerRepository();
    customerRepository = new InMemoryCustomerRepository();

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        TicketsService,
        Cryptography,
        { provide: TicketRepository, useValue: ticketRepository },
        { provide: PartnerRepository, useValue: partnerRepository },
        { provide: CustomerRepository, useValue: customerRepository },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
    cryptography = module.get<Cryptography>(Cryptography);

    const date = new Date();
    user = User.create({
      name: 'john',
      email: 'john@email.com',
      password: 'pwd12345',
      createdAt: date,
    });
    user.id = 1;
    partner = Partner.create({
      companyName: 'john ilimited',
      createdAt: date,
      user,
    });
    partner.id = 1;
    partnerRepository.partners.push(partner);
    customer = new Customer();
    customer.id = 1;
    customerRepository.customers.push(customer);
  });

  //#endregion [setup test]

  //#region [Create ticket]
  describe('Create ticket', () => {
    it('should be able create an ticket', async () => {
      await service.create([{ location: 'vip', price: 30 }], 1, 1);

      expect(ticketRepository.tickets).toHaveLength(1);
    });

    it('should be able create ten ticket', async () => {
      await service.create(
        [{ location: 'vip', price: 30, quantity: 10 }],
        1,
        1,
      );

      expect(ticketRepository.tickets).toHaveLength(10);
    });

    it('should throw an error if partner no exists', async () => {
      await expect(
        service.create([{ location: 'vip', price: 30, quantity: 10 }], 1, 2),
      ).rejects.toThrow();
    });
    it('should be able return tickets', async () => {
      const arr = Array.from({ length: 20 }).map(() =>
        Ticket.create({ location: 'vip', price: 30, event: { id: 1 } }),
      );
      await ticketRepository.save(arr);
      const arr2 = Array.from({ length: 20 }).map(() =>
        Ticket.create({ location: 'vip', price: 30, event: { id: 2 } }),
      );
      await ticketRepository.save(arr2);

      const arr3 = Array.from({ length: 20 }).map(() =>
        Ticket.create({
          location: 'vip',
          price: 30,
          status: TicketStatusEnum.SOLD,
          event: { id: 2 },
        }),
      );
      await ticketRepository.save(arr3);

      const page = 2;
      const tickets = await service.findByEventId(1, 2);

      const ticketsSold = await service.findByEventId(
        1,
        2,
        TicketStatusEnum.SOLD,
      );

      expect(tickets).toHaveLength(10);
      expect(tickets[tickets.length - 1].id).toBe(tickets.length * page);

      expect(ticketsSold).toHaveLength(10);
    });
  });
  //#endregion[Create ticket]

  //#region [Create ticket hash]
  describe('Create ticket hash', () => {
    it('should be able create ticket hash', async () => {
      const ticket = Ticket.create({
        location: 'vip',
        price: 30,
        status: TicketStatusEnum.SOLD,
        event: { id: 1 },
      });

      const purchase = new Purchase();
      purchase.id = 1;
      purchase.status = PurchaseStatusEnum.PAID;

      ticket.purchases = [purchase];
      await ticketRepository.save(ticket);

      jest
        .spyOn(cryptography, 'encrypt')
        .mockReturnValue(
          '3068f7e0ecb2c5c88ba923d7da0ee97b:bcb5ace03a8f6997f63a1ceb73b68778',
        );
      const { hash } = await service.createTicketHash(
        ticket.id,
        purchase.id,
        customer.id,
      );

      expect(hash).toBeTruthy();
    });

    it('should throw the Forbidden error when the customer cannot be found or the customerId is different', async () => {
      const ticket = Ticket.create({
        location: 'vip',
        price: 30,
        status: TicketStatusEnum.SOLD,
        event: { id: 1 },
      });

      const purchase = new Purchase();
      purchase.id = 1;
      purchase.status = PurchaseStatusEnum.PAID;

      ticket.purchases = [purchase];
      await ticketRepository.save(ticket);

      await expect(() =>
        service.createTicketHash(ticket.id, purchase.id, 2),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw a Not found error when the ticket cannot be found', async () => {
      const ticket = Ticket.create({
        location: 'vip',
        price: 30,
        status: TicketStatusEnum.SOLD,
        event: { id: 1 },
      });

      const purchase = new Purchase();
      purchase.id = 1;
      purchase.status = PurchaseStatusEnum.PAID;

      ticket.purchases = [purchase];
      await ticketRepository.save(ticket);

      // validar se o customer

      await expect(
        service.createTicketHash(2, purchase.id, customer.id),
      ).rejects.toThrow('Ticket not found');
    });

    it('should throw the error Not found when the purchase cannot be found', async () => {
      const ticket = Ticket.create({
        location: 'vip',
        price: 30,
        status: TicketStatusEnum.SOLD,
        event: { id: 1 },
      });

      const purchase = new Purchase();
      purchase.id = 1;
      purchase.status = PurchaseStatusEnum.PAID;

      ticket.purchases = [purchase];
      await ticketRepository.save(ticket);

      // validar se o customer

      await expect(
        service.createTicketHash(ticket.id, 2, customer.id),
      ).rejects.toThrow('Purchase not found');
    });
  });
  //#endregion[Create ticket hash]

  //#region [Validate ticket]
  describe('Validate ticket', () => {
    it('should be able verify an ticket valid', async () => {
      const ticket = Ticket.create({
        location: 'vip',
        price: 30,
        status: TicketStatusEnum.SOLD,
        event: { id: 1, partner },
      });

      const purchase = new Purchase();
      purchase.id = 1;
      purchase.status = PurchaseStatusEnum.PAID;

      ticket.purchases = [purchase];
      await ticketRepository.save(ticket);

      const hash =
        '3068f7e0ecb2c5c88ba923d7da0ee97b:bcb5ace03a8f6997f63a1ceb73b68778';

      // {ticketId}:{eventId}
      jest.spyOn(cryptography, 'decrypt').mockReturnValue('1:1');

      const isValid = await service.validate(partner.id, 1, hash);

      expect(isValid).toBeTruthy();
    });

    it('should return false if not found ticket', async () => {
      const ticket = Ticket.create({
        location: 'vip',
        price: 30,
        status: TicketStatusEnum.SOLD,
        event: { id: 1, partner },
      });

      const purchase = new Purchase();
      purchase.id = 1;
      purchase.status = PurchaseStatusEnum.PAID;

      ticket.purchases = [purchase];
      await ticketRepository.save(ticket);

      const hash =
        '3068f7e0ecb2c5c88ba923d7da0ee97b:bcb5ace03a8f6997f63a1ceb73b68778';

      // {ticketId}:{eventId}
      jest.spyOn(cryptography, 'decrypt').mockReturnValue('2:1');

      const isValid = await service.validate(partner.id, 1, hash);

      expect(isValid).toBeFalsy();
    });

    it('should throw the error Forbidden if the partner provided is not the owner of the event', async () => {
      const ticket = Ticket.create({
        location: 'vip',
        price: 30,
        status: TicketStatusEnum.SOLD,
        event: { id: 1, partner },
      });

      const purchase = new Purchase();
      purchase.id = 1;
      purchase.status = PurchaseStatusEnum.PAID;

      ticket.purchases = [purchase];
      await ticketRepository.save(ticket);

      const hash =
        '3068f7e0ecb2c5c88ba923d7da0ee97b:bcb5ace03a8f6997f63a1ceb73b68778';

      // {ticketId}:{eventId}
      jest.spyOn(cryptography, 'decrypt').mockReturnValue('1:1');

      await expect(service.validate(2, 1, hash)).rejects.toThrow(
        ForbiddenException,
      );
    });
    it("should return false if the ticket's eventId is different from the current eventId", async () => {
      const ticket = Ticket.create({
        location: 'vip',
        price: 30,
        status: TicketStatusEnum.SOLD,
        event: { id: 1, partner },
      });

      const purchase = new Purchase();
      purchase.id = 1;
      purchase.status = PurchaseStatusEnum.PAID;

      ticket.purchases = [purchase];
      await ticketRepository.save(ticket);

      const hash =
        '3068f7e0ecb2c5c88ba923d7da0ee97b:bcb5ace03a8f6997f63a1ceb73b68778';

      jest.spyOn(cryptography, 'decrypt').mockReturnValue('1:1');

      const isValid = await service.validate(partner.id, 2, hash);

      expect(isValid).toBeFalsy();
    });
    it("should return false if the ticket status is not 'sold'", async () => {
      const ticket = Ticket.create({
        location: 'vip',
        price: 30,
        status: TicketStatusEnum.AVAILABLE,
        event: { id: 1, partner },
      });

      const purchase = new Purchase();
      purchase.id = 1;
      purchase.status = PurchaseStatusEnum.PAID;

      ticket.purchases = [purchase];
      await ticketRepository.save(ticket);

      const hash =
        '3068f7e0ecb2c5c88ba923d7da0ee97b:bcb5ace03a8f6997f63a1ceb73b68778';

      jest.spyOn(cryptography, 'decrypt').mockReturnValue('1:1');

      const isValid = await service.validate(partner.id, 1, hash);

      expect(isValid).toBeFalsy();
    });
  });
  //#endregion[Validate ticket]
});
