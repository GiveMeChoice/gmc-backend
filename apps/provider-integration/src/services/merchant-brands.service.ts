import { PageRequest } from '@lib/database/interface/page-request.interface';
import { Page } from '@lib/database/interface/page.interface';
import { buildPage } from '@lib/database/utils/build-page';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MerchantBrand } from '../model/merchant-brand.entity';

@Injectable()
export class MerchantBrandsService {
  constructor(
    @InjectRepository(MerchantBrand)
    private readonly brandsRepo: Repository<MerchantBrand>,
  ) {}

  async findAll(pageRequest?: PageRequest): Promise<Page<MerchantBrand>> {
    const [data, count] = await this.brandsRepo.findAndCount({
      ...pageRequest,
    });
    return buildPage<MerchantBrand>(data, count, pageRequest);
  }

  findOne(id: string): Promise<MerchantBrand> {
    return this.brandsRepo.findOne({
      where: { id },
    });
  }

  async find(
    findDto: Partial<MerchantBrand>,
    pageRequest?: PageRequest,
  ): Promise<Page<MerchantBrand>> {
    const [data, count] = await this.brandsRepo.findAndCount({
      ...pageRequest,
      where: {
        ...findDto,
      },
    });
    return buildPage<MerchantBrand>(data, count, pageRequest);
  }

  findOneByMerchant(merchantId: string, title: string) {
    return this.brandsRepo.findOne({
      where: { merchantId, merchantBrandCode: title },
    });
  }

  create(brand: Partial<MerchantBrand>): Promise<MerchantBrand> {
    return this.brandsRepo.save(brand);
  }

  async update(
    id: string,
    brand: Partial<MerchantBrand>,
  ): Promise<MerchantBrand> {
    await this.brandsRepo.save({ id, ...brand });
    return await this.findOne(id);
  }
}
