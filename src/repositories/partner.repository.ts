import { Partner } from '@/partners/entities/partner.entity';

export abstract class PartnerRepository {
  abstract create(partner: Omit<Partner, 'id' | 'events'>): Partner;
  abstract save(partner: Partner): Promise<void>;
  abstract findByUserId(userId: number): Promise<Partner | null>;
}
