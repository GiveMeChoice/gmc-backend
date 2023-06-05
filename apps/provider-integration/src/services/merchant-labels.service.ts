import { PageRequest } from '@lib/database/interface/page-request.interface';
import { Page } from '@lib/database/interface/page.interface';
import { buildPage } from '@lib/database/utils/build-page';
import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MerchantLabel } from '../model/merchant-label.entity';
import { ProductsService } from './products.service';

@Injectable()
export class MerchantLabelsService {
  private readonly logger = new Logger(MerchantLabelsService.name);

  constructor(
    @InjectRepository(MerchantLabel)
    private readonly merchantLabelsRepo: Repository<MerchantLabel>,
    @Inject(forwardRef(() => ProductsService))
    private readonly productsService: ProductsService,
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
      where: { merchantId, merchantLabelCode: title },
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

  async assignGmcLabel(id: string, gmcLabelId: string): Promise<MerchantLabel> {
    throw new Error('Ruh roh! Merchant label assignment is broken!');
    // const merchantLabel = await this.findOne(id);
    // if (!merchantLabel) throw new Error(`Merchant Label Not Found: ${id}`);
    // await this.merchantLabelsRepo.save({
    //   id,
    //   gmcLabelId: gmcLabelId ? gmcLabelId : null,
    // });
    // const productIds = await this.productsService.findIds({
    //   merchantLabels: {
    //     id,
    //   } as MerchantLabel,
    // });
    // this.logger.debug(
    //   `Label reassigned. Reindexing ${productIds.data.length} products`,
    // );
    // await this.productsService.indexProductBatchAsync({
    //   merchantCategory: {
    //     id,
    //   } as MerchantCategory,
    // });
    // return await this.findOne(id);
  }
}
