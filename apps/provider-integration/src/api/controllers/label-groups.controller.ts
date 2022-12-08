import { LabelGroup } from '@app/provider-integration/model/label-group.entity';
import { LabelGroupsService } from '@app/provider-integration/services/label-groups.service';
import { Controller, Get, Param } from '@nestjs/common';

@Controller('label-groups')
export class LabelGroupsController {
  constructor(private readonly labelGroupsService: LabelGroupsService) {}

  @Get()
  async getAll(): Promise<LabelGroup[]> {
    return this.labelGroupsService.findAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<LabelGroup> {
    return this.labelGroupsService.findOne(id);
  }
}
