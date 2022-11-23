import { SourceRun } from '@app/provider-integration/model/source-run.entity';
import { SourceRunsService } from '@app/provider-integration/services/source-runs.service';
import { TransformPageRequestPipe } from '@app/provider-integration/utils/transform-page.pipe';
import { PageRequest } from '@lib/database/interface/page-request.interface';
import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { FindRunsDto } from '../dto/find-runs.dto';

@Controller('source-runs')
export class SourceRunsController {
  constructor(private readonly sourceRunsService: SourceRunsService) {}

  @Post('search')
  async search(
    @Query(TransformPageRequestPipe) pageRequest: PageRequest,
    @Body() findDto: FindRunsDto,
  ): Promise<SourceRun[]> {
    return await this.sourceRunsService.find(findDto, pageRequest);
  }

  @Get()
  async getAllRuns(
    @Query(TransformPageRequestPipe) pageRequest: PageRequest,
  ): Promise<SourceRun[]> {
    return await this.sourceRunsService.findAll(pageRequest);
  }

  @Get(':id')
  async getRun(@Param('id') id): Promise<SourceRun> {
    return await this.sourceRunsService.findOne(id);
  }
}
