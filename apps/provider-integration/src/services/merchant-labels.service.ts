import { PageRequest } from '@lib/database/interface/page-request.interface';
import { Page } from '@lib/database/interface/page.interface';
import { buildPage } from '@lib/database/utils/build-page';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { MerchantLabel } from '../model/merchant-label.entity';

@Injectable()
export class MerchantLabelsService {
  constructor(
    @InjectRepository(MerchantLabel)
    private readonly merchantLabelsRepo: Repository<MerchantLabel>,
  ) {}

  async findAll(pageRequest?: PageRequest): Promise<Page<MerchantLabel>> {
    const [data, count] = await this.merchantLabelsRepo.findAndCount({
      ...pageRequest,
    });
    return buildPage<MerchantLabel>(data, count, pageRequest);
  }

  findOne(id: string): Promise<MerchantLabel> {
    return this.merchantLabelsRepo.findOne({
      where: { id },
      relations: { gmcLabel: true },
    });
  }

  async find(
    findDto: Partial<MerchantLabel>,
    pageRequest?: PageRequest,
  ): Promise<Page<MerchantLabel>> {
    const [data, count] = await this.merchantLabelsRepo
      .createQueryBuilder('label')
      .where({
        ...findDto,
      })
      .setFindOptions({
        ...pageRequest,
        relations: {
          gmcLabel: true,
        },
        select: {
          gmcLabel: {
            name: true,
          },
        },
      })
      .loadRelationCountAndMap('label.productCount', 'label.products')
      .getManyAndCount();
    return buildPage<MerchantLabel>(data, count, pageRequest);
  }

  findOneByMerchant(merchantId: string, title: string) {
    return this.merchantLabelsRepo.findOne({
      where: { merchantId, code: title },
    });
  }

  create(label: Partial<MerchantLabel>): Promise<MerchantLabel> {
    return this.merchantLabelsRepo.save(label);
  }

  async update(
    id: string,
    label: Partial<MerchantLabel>,
  ): Promise<MerchantLabel> {
    await this.merchantLabelsRepo.save({ id, ...label });
    return await this.findOne(id);
  }
}
