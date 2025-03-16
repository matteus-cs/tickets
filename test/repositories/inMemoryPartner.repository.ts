/* eslint-disable @typescript-eslint/require-await */
import { PartnerRepository } from '@/repositories/partner.repository';
import { Partner } from '@/partners/entities/partner.entity';

export class InMemoryPartnerRepository implements PartnerRepository {
  public partners: Partner[] = [];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  create(partner: Omit<Partner, 'id' | 'events'>): Partner {
    throw new Error('Method not implemented.');
  }
  async save(partner: Partner): Promise<void> {
    this.partners.push(partner);
  }
  async findByUserId(userId: number): Promise<Partner | null> {
    return this.partners.find((p) => p.user.id === userId) ?? null;
  }
  async findOneBy(email: string): Promise<Partner | null> {
    return this.partners.find((p) => p.user.email === email) ?? null;
  }
}
