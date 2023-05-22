import { PageRequest } from '@lib/database/interface/page-request.interface';
import { Page } from '@lib/database/interface/page.interface';
import { buildPage } from '@lib/database/utils/build-page';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { GmcCategory } from '../model/gmc-category.entity';
import { MerchantCategory } from '../model/merchant-category.entity';
import { GmcCategoriesService } from './gmc-categories.service';
import { IndexService } from './index.service';

@Injectable()
export class MerchantCategoriesService {
  private readonly logger = new Logger(MerchantCategoriesService.name);

  constructor(
    @InjectRepository(MerchantCategory)
    private readonly merchantCategoriesRepo: Repository<MerchantCategory>,
    private readonly categoryService: GmcCategoriesService,
    private readonly indexService: IndexService,
  ) {}

  async findAll(pageRequest?: PageRequest): Promise<Page<MerchantCategory>> {
    const [data, count] = await this.merchantCategoriesRepo.findAndCount({
      ...pageRequest,
      relations: {
        gmcCategory: true,
      },
    });
    return buildPage<MerchantCategory>(data, count, pageRequest);
  }

  findOne(id: string): Promise<MerchantCategory> {
    return this.merchantCategoriesRepo.findOne({
      where: { id },
      relations: { gmcCategory: true },
    });
  }

  async find(
    findDto: Partial<MerchantCategory>,
    pageRequest?: PageRequest,
  ): Promise<Page<MerchantCategory>> {
    const categoryIds = [];
    if (findDto.gmcCategoryId) {
      const descendents = (await this.categoryService.findDescendents(
        findDto.gmcCategoryId,
      )) as GmcCategory[];
      for (const descendent of descendents) {
        categoryIds.push(descendent.id);
      }
    }
    const [data, count] = await this.merchantCategoriesRepo
      .createQueryBuilder('category')
      .where({
        ...findDto,
        ...(findDto.code && { code: Like(`${findDto.code}%`) }),
        ...(findDto.gmcCategoryId && { categoryId: In(categoryIds) }),
      })
      .setFindOptions({
        ...pageRequest,
        relations: {
          gmcCategory: true,
        },
        select: {
          gmcCategory: {
            id: true,
            name: true,
          },
        },
      })
      .loadRelationCountAndMap('category.productCount', 'category.products')
      .getManyAndCount();
    return buildPage<MerchantCategory>(data, count, pageRequest);
  }

  findOneByMerchant(merchantId: string, title: string) {
    return this.merchantCategoriesRepo.findOne({
      where: { merchantId, code: title },
    });
  }

  create(category: Partial<MerchantCategory>): Promise<MerchantCategory> {
    return this.merchantCategoriesRepo.save(category);
  }

  async update(
    id: string,
    category: Partial<MerchantCategory>,
  ): Promise<MerchantCategory> {
    await this.merchantCategoriesRepo.save({ id, ...category });
    return await this.findOne(id);
  }

  async assignGmcCategory(
    id: string,
    gmcCategoryId: string,
  ): Promise<MerchantCategory> {
    const merchantCategory = await this.findOne(id);
    if (!merchantCategory)
      throw new Error(`Merchant Category Not Found: ${id}`);
    await this.merchantCategoriesRepo.save({
      id,
      categoryId: gmcCategoryId ? gmcCategoryId : null,
    });
    Logger.debug(`Merchant Category Reassigned. Reindexing products.`);
    await this.indexService.indexProductBatchAsync({
      merchantCategory: {
        id,
      } as MerchantCategory,
    });
    return await this.findOne(id);
  }
}
