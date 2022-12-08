import { CategoryGroup } from '@app/provider-integration/model/category-group.entity';
import { CategoryGroupsService } from '@app/provider-integration/services/category-groups.service';
import { Controller, Get, Param } from '@nestjs/common';

@Controller('category-groups')
export class CategoryGroupsController {
  constructor(private readonly categoryGroupsService: CategoryGroupsService) {}

  @Get()
  async getAll(): Promise<CategoryGroup[]> {
    return this.categoryGroupsService.findAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<CategoryGroup> {
    return this.categoryGroupsService.findOne(id);
  }
}
