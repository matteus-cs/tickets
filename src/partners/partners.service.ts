import { Injectable } from '@nestjs/common';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Partner } from './entities/partner.entity';

@Injectable()
export class PartnersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Partner)
    private partnerRepository: Repository<Partner>,

    private dataSource: DataSource,
  ) {}
  async create(createPartnerDto: CreatePartnerDto): Promise<void> {
    const { name, email, password, companyName } = createPartnerDto;
    const createdAt = new Date();
    const user = this.userRepository.create({
      name,
      email,
      password,
      updatedAt: createdAt,
      createdAt,
    });
    const partner = this.partnerRepository.create({
      companyName,
      createdAt,
      user,
    });
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.dataSource.manager.save(user);
      await this.dataSource.manager.save(partner);
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
