import { SourceRun } from '@app/provider-integration/model/source-run.entity';
import { SourceRunsService } from '@app/provider-integration/services/source-runs.service';
import { TransformPageRequestPipe } from '@app/provider-integration/utils/transform-page.pipe';
import { PageRequest } from '@lib/database/interface/page-request.interface';
import { Body, Controller, Get, Param, Query } from '@nestjs/common';
import { FindRunsDto } from '../dto/find-runs.dto';

@Controller('source-runs')
export class SourceRunsController {
  constructor(private readonly sourceRunsService: SourceRunsService) {}

  @Get()
  async find(
    @Query(TransformPageRequestPipe) pageRequest: PageRequest,
    @Body() findDto: FindRunsDto,
  ): Promise<SourceRun[]> {
    return await this.sourceRunsService.find(findDto, pageRequest);
  }

  @Get(':id')
  async getOne(@Param('id') id): Promise<SourceRun> {
    return await this.sourceRunsService.findOne(id);
  }
}
