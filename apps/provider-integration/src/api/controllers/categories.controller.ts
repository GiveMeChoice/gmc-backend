import { Category } from '@app/provider-integration/model/category.entity';
import { CategoriesService } from '@app/provider-integration/services/categories.service';
import { SearchCategoryDto } from '@lib/search/dto/search-category.dto';
import { Controller, Get, Logger, Param, Query } from '@nestjs/common';

@Controller('categories')
export class CategoryController {
  private readonly logger = new Logger(CategoryController.name);

  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async getAll(@Query('tree') tree: boolean): Promise<any> {
    return this.categoriesService.findAll(tree);
  }

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<Category> {
    return await this.categoriesService.findOne(id);
  }

  @Get(':id/ancestors')
  async getAncestors(
    @Param('id') id: string,
    @Query('tree') tree: boolean,
  ): Promise<any> {
    return await this.categoriesService.findAncestors(id, tree);
  }

  private invertTree(category: Category, nodes: string[]): string[] {
    nodes.push(category.name);
    return category.parent && category.parent.name !== 'Root'
      ? this.invertTree(category.parent, nodes)
      : nodes;
  }

  @Get(':id/descendents')
  async getDescendents(
    @Param('id') id: string,
    @Query('tree') tree: boolean,
  ): Promise<any> {
    return this.categoriesService.findDescendents(id, tree);
  }
}
