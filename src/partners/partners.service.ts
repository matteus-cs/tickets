import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { User } from '@/users/entities/user.entity';
import { PartnerRepository } from '@/repositories/partner.repository';
import { Partner } from './entities/partner.entity';

@Injectable()
export class PartnersService {
  constructor(private partnerRepository: PartnerRepository) {}
  async create(createPartnerDto: CreatePartnerDto): Promise<void> {
    const { name, email, password, companyName } = createPartnerDto;
    const partnerAlreadyExists = await this.partnerRepository.findOneBy(email);
    if (partnerAlreadyExists) {
      throw new BadRequestException('partner already exists');
    }
    const createdAt = new Date();
    const user = User.create({
      name,
      email,
      password,
      createdAt,
    });

    const partner = Partner.create({ companyName, createdAt, user });

    await this.partnerRepository.save(partner);
  }

  async findByUserId(userId: number) {
    const partner = await this.partnerRepository.findByUserId(userId);
    return partner;
  }
}
