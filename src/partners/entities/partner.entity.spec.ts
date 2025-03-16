import { Partner } from './partner.entity';

describe('Partner Entity', () => {
  it('should be able create a instance of partner', () => {
    const partner = Partner.create({
      companyName: 'John Doe',
    });

    expect(partner).toBeInstanceOf(Partner);
    expect(partner.companyName).toBe('John Doe');
  });
});
