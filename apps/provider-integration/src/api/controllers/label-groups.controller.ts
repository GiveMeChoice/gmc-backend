import { LabelGroup } from '@app/provider-integration/model/label-group.entity';
import { LabelGroupsService } from '@app/provider-integration/services/label-groups.service';
import { Controller, Get, Logger, Param, Query } from '@nestjs/common';

@Controller('label-groups')
export class LabelGroupsController {
  private readonly logger = new Logger(LabelGroupsController.name);

  constructor(private readonly labelGroupsService: LabelGroupsService) {}

  @Get()
  async getAll(@Query('tree') tree: boolean): Promise<any> {
    return this.labelGroupsService.findAll(tree);
  }

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<LabelGroup> {
    return await this.labelGroupsService.findOne(id);
  }

  @Get(':id/ancestors')
  async getAncestors(
    @Param('id') id: string,
    @Query('tree') tree: boolean,
  ): Promise<any> {
    return await this.labelGroupsService.findAncestors(id, tree);
  }

  private invertTree(group: LabelGroup, nodes: string[]): string[] {
    nodes.push(group.name);
    return group.parent && group.parent.name !== 'Root'
      ? this.invertTree(group.parent, nodes)
      : nodes;
  }

  @Get(':id/descendents')
  async getDescendents(
    @Param('id') id: string,
    @Query('tree') tree: boolean,
  ): Promise<any> {
    return this.labelGroupsService.findDescendents(id, tree);
  }
}
