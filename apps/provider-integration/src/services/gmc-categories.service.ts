import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreeRepository } from 'typeorm';
import { GmcCategory } from '../model/gmc-category.entity';

@Injectable()
export class GmcCategoriesService {
  private readonly logger = new Logger(GmcCategoriesService.name);

  constructor(
    @InjectRepository(GmcCategory)
    private readonly categoryRepo: TreeRepository<GmcCategory>,
  ) {}

  async findAll(tree?: boolean): Promise<GmcCategory | GmcCategory[]> {
    return tree
      ? (await this.categoryRepo.findTrees())[0]
      : this.categoryRepo.find();
  }

  findOne(id: string): Promise<GmcCategory> {
    return this.categoryRepo.findOne({
      where: { id },
      relations: { merchantCategories: true },
    });
  }

  async findAncestors(
    id: string,
    tree?: boolean,
  ): Promise<GmcCategory | GmcCategory[]> {
    const childCategory = await this.categoryRepo.findOne({ where: { id } });
    return tree
      ? await this.categoryRepo.findAncestorsTree(childCategory)
      : await this.categoryRepo.findAncestors(childCategory);
  }

  async findDescendents(
    id: string,
    tree?: boolean,
  ): Promise<GmcCategory | GmcCategory[]> {
    const parentCategory = await this.categoryRepo.findOne({ where: { id } });
    return tree
      ? await this.categoryRepo.findDescendantsTree(parentCategory)
      : await this.categoryRepo.findDescendants(parentCategory);
  }

  create(category: Partial<GmcCategory>): Promise<GmcCategory> {
    return this.categoryRepo.save(category);
  }

  udpate(id: string, updates: Partial<GmcCategory>): Promise<GmcCategory> {
    return this.categoryRepo.save({ id, ...updates });
  }
}
