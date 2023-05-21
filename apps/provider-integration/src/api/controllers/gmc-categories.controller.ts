import { GmcCategory } from '@app/provider-integration/model/gmc-category.entity';
import { GmcCategoriesService } from '@app/provider-integration/services/gmc-categories.service';
import { Controller, Get, Logger, Param, Query } from '@nestjs/common';

@Controller('gmc-categories')
export class GmcCategoriesController {
  private readonly logger = new Logger(GmcCategoriesController.name);

  constructor(private readonly gmcCategoriesService: GmcCategoriesService) {}

  @Get()
  async getAll(@Query('tree') tree: boolean): Promise<any> {
    return this.gmcCategoriesService.findAll(tree);
  }

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<GmcCategory> {
    return await this.gmcCategoriesService.findOne(id);
  }

  @Get(':id/ancestors')
  async getAncestors(
    @Param('id') id: string,
    @Query('tree') tree: boolean,
  ): Promise<any> {
    return await this.gmcCategoriesService.findAncestors(id, tree);
  }

  private invertTree(category: GmcCategory, nodes: string[]): string[] {
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
    return this.gmcCategoriesService.findDescendents(id, tree);
  }
}
