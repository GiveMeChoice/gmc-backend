import { PageRequest } from '@lib/database/interface/page-request.interface';
import { Page } from '@lib/database/interface/page.interface';
import { buildPage } from '@lib/database/utils/build-page';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Like, Repository } from 'typeorm';
import { GmcCategory } from '../model/gmc-category.entity';
import { MerchantCategory } from '../model/merchant-category.entity';
import { GmcCategoriesService } from './gmc-categories.service';
import { ProductDocumentsService } from './product-documents.service';
import { FindMerchantCategoriesDto } from '../api/dto/find-merchant-categories.dto';

@Injectable()
export class MerchantCategoriesService {
  private readonly logger = new Logger(MerchantCategoriesService.name);

  constructor(
    @InjectRepository(MerchantCategory)
    private readonly merchantCategoriesRepo: Repository<MerchantCategory>,
    private readonly gmcCategoryService: GmcCategoriesService,
    private readonly productDocumentsService: ProductDocumentsService,
  ) {}

  async findAll(pageRequest?: PageRequest): Promise<Page<MerchantCategory>> {
    const [data, count] = await this.merchantCategoriesRepo.findAndCount({
      ...pageRequest,
      relations: {
        gmcCategory: true,
        merchant: true,
      },
    });
    return buildPage<MerchantCategory>(data, count, pageRequest);
  }

  findOne(id: string): Promise<MerchantCategory> {
    return this.merchantCategoriesRepo
      .createQueryBuilder('category')
      .where({ id })
      .setFindOptions({ relations: { gmcCategory: true, merchant: true } })
      .loadRelationCountAndMap('category.productCount', 'category.products')
      .getOne();
  }

  async find(
    findDto: FindMerchantCategoriesDto,
    pageRequest?: PageRequest,
  ): Promise<Page<MerchantCategory>> {
    const gmcCategoryIds = [];
    if (findDto.gmcCategoryId) {
      const descendants = (await this.gmcCategoryService.findDescendents(
        findDto.gmcCategoryId,
      )) as GmcCategory[];
      for (const descendant of descendants) {
        gmcCategoryIds.push(descendant.id);
      }
    }
    let unassigned = false;
    if (findDto.unassigned) {
      unassigned = true;
      delete findDto.unassigned;
    }
    const [data, count] = await this.merchantCategoriesRepo
      .createQueryBuilder('category')
      .where({
        ...findDto,
        ...(findDto.merchantCategoryCode && {
          merchantCategoryCode: Like(`${findDto.merchantCategoryCode}%`),
        }),
        ...(findDto.gmcCategoryId && { gmcCategoryId: In(gmcCategoryIds) }),
        ...(unassigned && { gmcCategoryId: IsNull() }),
      })
      .setFindOptions({
        ...pageRequest,
        relations: {
          gmcCategory: true,
          merchant: true,
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
      where: { merchantId, merchantCategoryCode: title },
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
      gmcCategoryId: gmcCategoryId ? gmcCategoryId : null,
    });
    Logger.debug(`Merchant Category Reassigned. Updating Index.`);
    await this.productDocumentsService.indexBatchAsync({
      merchantCategory: {
        id,
      } as MerchantCategory,
    });
    return await this.findOne(id);
  }
}
