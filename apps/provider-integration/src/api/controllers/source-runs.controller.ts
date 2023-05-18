import { ProviderSourceRun } from '@app/provider-integration/model/provider-source-run.entity';
import { ProviderSourceRunsService } from '@app/provider-integration/services/provider-source-runs.service';
import { TransformPageRequestPipe } from '@app/provider-integration/utils/transform-page.pipe';
import { PageRequest } from '@lib/database/interface/page-request.interface';
import { Page } from '@lib/database/interface/page.interface';
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
  private readonly logger = new Logger(SourceRunsController.name);

  constructor(private readonly runsService: ProviderSourceRunsService) {}

  @Post('find')
  async find(
    @Query(TransformPageRequestPipe) pageRequest: PageRequest,
    @Body() findDto: FindRunsDto,
  ): Promise<Page<ProviderSourceRun>> {
    this.logger.debug(JSON.stringify(findDto));
    return await this.runsService.find(findDto, pageRequest);
  }

  @Get()
  async getAllRuns(
    @Query(TransformPageRequestPipe) pageRequest: PageRequest,
  ): Promise<Page<ProviderSourceRun>> {
    return await this.runsService.findAll(pageRequest);
  }

  @Get(':id')
  async getRun(@Param('id') id): Promise<ProviderSourceRun> {
    return await this.runsService.findOne(id);
  }
}
