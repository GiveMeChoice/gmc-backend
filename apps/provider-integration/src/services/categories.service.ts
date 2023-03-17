import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreeRepository } from 'typeorm';
import { Category } from '../model/category.entity';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: TreeRepository<Category>,
  ) {}

  async findAll(tree?: boolean): Promise<Category | Category[]> {
    return tree
      ? (await this.categoryRepo.findTrees())[0]
      : this.categoryRepo.find();
  }

  findOne(id: string): Promise<Category> {
    return this.categoryRepo.findOne({
      where: { id },
      relations: { providerCategories: true },
    });
  }

  async findAncestors(
    id: string,
    tree?: boolean,
  ): Promise<Category | Category[]> {
    const childCategory = await this.categoryRepo.findOne({ where: { id } });
    return tree
      ? await this.categoryRepo.findAncestorsTree(childCategory)
      : await this.categoryRepo.findAncestors(childCategory);
  }

  async findDescendents(
    id: string,
    tree?: boolean,
  ): Promise<Category | Category[]> {
    const parentCategory = await this.categoryRepo.findOne({ where: { id } });
    return tree
      ? await this.categoryRepo.findDescendantsTree(parentCategory)
      : await this.categoryRepo.findDescendants(parentCategory);
  }

  create(category: Partial<Category>): Promise<Category> {
    return this.categoryRepo.save(category);
  }

  udpate(id: string, updates: Partial<Category>): Promise<Category> {
    return this.categoryRepo.save({ id, ...updates });
  }
}
