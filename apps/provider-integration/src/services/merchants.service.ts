import { PageRequest } from '@lib/database/interface/page-request.interface';
import { Page } from '@lib/database/interface/page.interface';
import { buildPage } from '@lib/database/utils/build-page';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindMerchantsDto } from '../api/dto/find-merchants.dto';
import { MerchantKey } from '../model/enum/merchant-key.enum';
import { Merchant } from '../model/merchant.entity';

@Injectable()
export class MerchantsService {
  constructor(
    @InjectRepository(Merchant) private merchantsRepo: Repository<Merchant>,
  ) {}

  async find(
    findDto: FindMerchantsDto,
    pageRequest: PageRequest,
  ): Promise<Page<Merchant>> {
    const [data, count] = await this.merchantsRepo
      .createQueryBuilder('merchant')
      .where({ ...findDto })
      .setFindOptions({ ...pageRequest, relations: { providers: true } })
      .loadRelationCountAndMap('merchant.labelCount', 'merchant.labels')
      .loadRelationCountAndMap('merchant.productCount', 'merchant.products')
      .loadRelationCountAndMap('merchant.categoryCount', 'merchant.categories')
      .loadRelationCountAndMap('merchant.providersCount', 'merchant.providers')
      .getManyAndCount();
    return buildPage<Merchant>(data, count, pageRequest);
  }

  async findAll(pageRequest?: PageRequest): Promise<Page<Merchant>> {
    const [data, count] = await this.merchantsRepo.findAndCount({
      ...pageRequest,
    });
    return buildPage<Merchant>(data, count, pageRequest);
  }

  findOne(id: string): Promise<Merchant> {
    return this.merchantsRepo.findOneBy({ id });
  }

  findOneByKey(key: MerchantKey): Promise<Merchant> {
    if (!key) return null;
    return this.merchantsRepo.findOneBy({ key });
  }

  async update(id: string, updates: Partial<Merchant>): Promise<Merchant> {
    await this.merchantsRepo.update(id, updates);
    return this.merchantsRepo.findOne({ where: { id } });
  }
}
