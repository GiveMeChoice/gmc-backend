import { PageRequest } from '@lib/database/interface/page-request.interface';
import { Page } from '@lib/database/interface/page.interface';
import { buildPage } from '@lib/database/utils/build-page';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../model/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepo: Repository<Category>,
  ) {}

  async findAll(pageRequest?: PageRequest): Promise<Page<Category>> {
    const [data, count] = await this.categoriesRepo.findAndCount({
      ...pageRequest,
    });
    return buildPage<Category>(data, count, pageRequest);
  }

  findOne(id: string): Promise<Category> {
    return this.categoriesRepo.findOne({
      where: { id },
      relations: { group: true },
    });
  }

  async find(
    findDto: Partial<Category>,
    pageRequest?: PageRequest,
  ): Promise<Page<Category>> {
    const [data, count] = await this.categoriesRepo
      .createQueryBuilder('category')
      .where({
        ...findDto,
      })
      .setFindOptions({
        ...pageRequest,
        relations: {
          group: true,
        },
        select: {
          group: {
            name: true,
          },
        },
      })
      .loadRelationCountAndMap('category.productCount', 'category.products')
      .getManyAndCount();
    return buildPage<Category>(data, count, pageRequest);
  }

  findOneByProvider(providerId: string, title: string) {
    return this.categoriesRepo.findOne({
      where: { providerId, code: title },
    });
  }

  create(category: Partial<Category>): Promise<Category> {
    return this.categoriesRepo.save(category);
  }

  async update(id: string, category: Partial<Category>): Promise<Category> {
    await this.categoriesRepo.save({ id, ...category });
    return await this.findOne(id);
  }
}
