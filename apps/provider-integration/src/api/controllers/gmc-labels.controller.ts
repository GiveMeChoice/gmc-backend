import { GmcLabel } from '@app/provider-integration/model/gmc-label.entity';
import { GmcLabelsService } from '@app/provider-integration/services/gmc-labels.service';
import { Controller, Get, Logger, Param, Query } from '@nestjs/common';

@Controller('gmc-labels')
export class GmcLabelsController {
  private readonly logger = new Logger(GmcLabelsController.name);

  constructor(private readonly gmcLabelsService: GmcLabelsService) {}

  @Get()
  async getAll(@Query('tree') tree: boolean): Promise<any> {
    return this.gmcLabelsService.findAll(tree);
  }

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<GmcLabel> {
    return await this.gmcLabelsService.findOne(id);
  }

  @Get(':id/ancestors')
  async getAncestors(
    @Param('id') id: string,
    @Query('tree') tree: boolean,
  ): Promise<any> {
    return await this.gmcLabelsService.findAncestors(id, tree);
  }

  private invertTree(gmcLabel: GmcLabel, nodes: string[]): string[] {
    nodes.push(gmcLabel.name);
    return gmcLabel.parent && gmcLabel.parent.name !== 'Root'
      ? this.invertTree(gmcLabel.parent, nodes)
      : nodes;
  }

  @Get(':id/descendents')
  async getDescendents(
    @Param('id') id: string,
    @Query('tree') tree: boolean,
  ): Promise<any> {
    return this.gmcLabelsService.findDescendents(id, tree);
  }
}
