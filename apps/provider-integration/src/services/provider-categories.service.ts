import { PageRequest } from '@lib/database/interface/page-request.interface';
import { Page } from '@lib/database/interface/page.interface';
import { buildPage } from '@lib/database/utils/build-page';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';
import { Category } from '../model/category.entity';
import { ProviderCategory } from '../model/provider-category.entity';

@Injectable()
export class ProviderCategoriesService {
  private readonly logger = new Logger(ProviderCategoriesService.name);

  constructor(
    @InjectRepository(ProviderCategory)
    private readonly providerCategoriesRepo: Repository<ProviderCategory>,
    @InjectRepository(Category)
    private readonly categoryRepo: TreeRepository<Category>,
  ) {}

  async findAll(pageRequest?: PageRequest): Promise<Page<ProviderCategory>> {
    const [data, count] = await this.providerCategoriesRepo.findAndCount({
      ...pageRequest,
      relations: {
        category: true,
      },
    });
    return buildPage<ProviderCategory>(data, count, pageRequest);
  }

  findOne(id: string): Promise<ProviderCategory> {
    return this.providerCategoriesRepo.findOne({
      where: { id },
      relations: { category: true },
    });
  }

  async find(
    findDto: Partial<ProviderCategory>,
    pageRequest?: PageRequest,
  ): Promise<Page<ProviderCategory>> {
    const [data, count] = await this.providerCategoriesRepo
      .createQueryBuilder('category')
      .where({
        ...findDto,
      })
      .setFindOptions({
        ...pageRequest,
        relations: {
          category: true,
        },
        select: {
          category: {
            id: true,
            name: true,
          },
        },
      })
      .loadRelationCountAndMap('category.productCount', 'category.products')
      .getManyAndCount();
    return buildPage<ProviderCategory>(data, count, pageRequest);
  }

  findOneByProvider(providerId: string, title: string) {
    return this.providerCategoriesRepo.findOne({
      where: { providerId, code: title },
    });
  }

  create(category: Partial<ProviderCategory>): Promise<ProviderCategory> {
    return this.providerCategoriesRepo.save(category);
  }

  async update(
    id: string,
    category: Partial<ProviderCategory>,
  ): Promise<ProviderCategory> {
    // this.logger.debug(JSON.stringify());
    await this.providerCategoriesRepo.save({ id, ...category });
    return await this.findOne(id);
  }

  async assignCategory(
    id: string,
    categoryId: string,
  ): Promise<ProviderCategory> {
    const pc = await this.findOne(id);
    if (!pc) throw new Error(`Provider Category Not Found: ${id}`);
    await this.providerCategoriesRepo.save({
      id,
      categoryId: categoryId ? categoryId : null,
    });
    return await this.findOne(id);
  }
}
