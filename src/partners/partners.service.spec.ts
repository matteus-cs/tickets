import { PartnersService } from './partners.service';
import { InMemoryPartnerRepository } from './inMemoryPartner.repository';
import { Partner } from './entities/partner.entity';

describe('PartnersService', () => {
  let service: PartnersService;
  let partnerRepository: InMemoryPartnerRepository;

  beforeEach(() => {
    partnerRepository = new InMemoryPartnerRepository();
    service = new PartnersService(partnerRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(partnerRepository).toBeInstanceOf(InMemoryPartnerRepository);
  });

  it('should be able create an partner', async () => {
    await service.create({
      name: 'John Doe',
      email: 'john_partner@email.com',
      password: 'pass1234',
      companyName: 'John Ilimited',
    });
    expect(partnerRepository.partners).toHaveLength(1);
    expect(partnerRepository.partners[0]).toBeInstanceOf(Partner);
  });

  it('should be throw an error when partner already exists', async () => {
    await service.create({
      name: 'John Doe',
      email: 'john_partner@email.com',
      password: 'pass1234',
      companyName: 'John Ilimited',
    });
    await expect(
      service.create({
        name: 'John Doe',
        email: 'john_partner@email.com',
        password: 'pass1234',
        companyName: 'John Ilimited',
      }),
    ).rejects.toThrow();
  });
});
