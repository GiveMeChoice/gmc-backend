import { Run } from '@app/provider-integration/model/run.entity';
import { RunsService } from '@app/provider-integration/services/runs.service';
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

@Controller('runs')
export class RunsController {
  private readonly logger = new Logger(RunsController.name);

  constructor(private readonly runsService: RunsService) {}

  @Post('find')
  async find(
    @Query(TransformPageRequestPipe) pageRequest: PageRequest,
    @Body() findDto: FindRunsDto,
  ): Promise<Page<Run>> {
    this.logger.debug(JSON.stringify(findDto));
    return await this.runsService.find(findDto, pageRequest);
  }

  @Get()
  async getAllRuns(
    @Query(TransformPageRequestPipe) pageRequest: PageRequest,
  ): Promise<Page<Run>> {
    return await this.runsService.findAll(pageRequest);
  }

  @Get(':id')
  async getRun(@Param('id') id): Promise<Run> {
    return await this.runsService.findOne(id);
  }
}
