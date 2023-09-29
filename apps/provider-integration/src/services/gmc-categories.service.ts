import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreeRepository } from 'typeorm';
import { CreateGmcCategoryDto } from '../api/dto/create-gmc-category.dto';
import { GmcCategory } from '../model/gmc-category.entity';
import { UpdateGmcCategoryDto } from '../api/dto/update-gmc-category.dto';

@Injectable()
export class GmcCategoriesService {
  private readonly logger = new Logger(GmcCategoriesService.name);

  constructor(
    @InjectRepository(GmcCategory)
    private readonly categoryRepo: TreeRepository<GmcCategory>,
  ) {}

  async findAll(deep: boolean): Promise<GmcCategory[]> {
    return (
      await this.categoryRepo.findTrees({
        depth: deep ? 10 : 1,
        relations: ['merchantCategories'],
      })
    )[0].children;
  }

  async findOne(id: string, deep: boolean): Promise<GmcCategory> {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: { merchantCategories: true },
    });
    if (!category) {
      throw new NotFoundException();
    }
    return await this.categoryRepo.findDescendantsTree(category, {
      depth: deep ? 10 : 1,
      relations: ['merchantCategories'],
    });
  }

  async findDescendents(id: string): Promise<GmcCategory[]> {
    const parentCategory = await this.categoryRepo.findOne({ where: { id } });
    return await this.categoryRepo.findDescendants(parentCategory, {
      relations: ['merchantCategories'],
    });
  }

  async create(createDto: CreateGmcCategoryDto): Promise<GmcCategory> {
    const parent = await this.categoryRepo.findOne({
      where: { id: createDto.parentId },
    });
    if (!parent) throw new Error('Unable to find parent category');
    const slug = createDto.slug.toLowerCase();

    const category = new GmcCategory(createDto.name, slug);
    category.parent = parent;
    return await this.categoryRepo.save(category);
  }

  async udpate(
    id: string,
    updateDto: UpdateGmcCategoryDto,
  ): Promise<GmcCategory> {
    const category = await this.categoryRepo.findOne({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException();
    }
    await this.categoryRepo.save({ id, ...updateDto });
    return await this.categoryRepo.findOne({
      where: { id },
      relations: { merchantCategories: true, children: true },
    });
  }

  async delete(id: string) {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: { children: true, merchantCategories: true },
    });
    if (!category) {
      throw new NotFoundException();
    }
    if (
      category.children.length > 0 ||
      category.merchantCategories.length > 0
    ) {
      throw new Error(
        'Cannot delete category with existing child categories or assigned merchant categories',
      );
    }
    this.categoryRepo.delete({ id });
  }
}
