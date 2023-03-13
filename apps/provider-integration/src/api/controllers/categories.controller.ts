import { Category } from '@app/provider-integration/model/category.entity';
import { CategoriesService } from '@app/provider-integration/services/categories.service';
import { Controller, Get, Logger, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';
import { TreeType } from 'typeorm/metadata/types/TreeTypes';

@Controller('categories')
export class CategoryController {
  private readonly logger = new Logger(CategoryController.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: TreeRepository<Category>,
  ) {}

  @Get()
  async getAll(): Promise<any> {
    // return this.categoryRepo.findDescendants(
    //   (await this.categoryRepo.findRoots())[0],
    // );
    return this.categoryRepo.findTrees();
  }

  // private prepareAllFlat(category: Category, level: number, flattened: any[]) {
  //   flattened.push({
  //     name: category.name,
  //     level,
  //   });
  //   category.children.forEach((cat) => {
  //     prepareSelect(cat, level + 1, options);
  //   });
  // }

  @Get('tree')
  async getTree(): Promise<any> {
    return this.categoryRepo.findTrees();
  }

  @Get('roots')
  async getRoots(): Promise<any> {
    return this.categoryRepo.findRoots();
  }

  @Get('ancestors')
  async getAncestors(): Promise<any> {
    const id = 'e2d2b189-ae26-45dd-a781-3df4f454c26e';
    const category = await this.categoryRepo.findOne({ where: { id } });
    this.logger.debug(category);
    return this.categoryRepo.findAncestors(category);
  }

  // @Get()
  // async getAll(): Promise<Category[]> {
  //   return this.categoryService.findAll();
  // }

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<Category> {
    return await this.categoryRepo.findOne({
      where: { id },
      relations: { providerCategories: true },
    });
  }
}
