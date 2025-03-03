import { PartnerRepository } from '@/repositories/partner.repository';
import { Partner } from './entities/partner.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class PartnerRepositoryAdapter implements PartnerRepository {
  private partnerRepository: Repository<Partner>;
  constructor(private readonly dataSource: DataSource) {
    this.partnerRepository = dataSource.getRepository(Partner);
  }
  create(partner: Omit<Partner, 'id'>): Partner {
    return this.partnerRepository.create(partner);
  }
  async save(partner: Partner): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      await queryRunner.manager.save(partner.user);
      await queryRunner.manager.save(partner);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  async findByUserId(userId: number): Promise<Partner | null> {
    return await this.partnerRepository.findOneBy({ user: { id: userId } });
  }
}
