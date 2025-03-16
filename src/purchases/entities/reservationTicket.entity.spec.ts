import {
  ReservationTicket,
  ReservationTicketStatusEnum,
} from './reservationTicket.entity';

describe('ReservationTicket Entity', () => {
  it('should be able create an instance reservationTicket', () => {
    const reservationTicket = ReservationTicket.create({ ticket: { id: 1 } });

    expect(reservationTicket).toBeInstanceOf(ReservationTicket);
    expect(ReservationTicketStatusEnum.RESERVED).toBe(
      ReservationTicketStatusEnum.RESERVED,
    );
    expect(reservationTicket.ticket.id).toBe(1);
  });
});
