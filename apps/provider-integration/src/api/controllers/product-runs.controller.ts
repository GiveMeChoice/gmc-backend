import { ProductRun } from '@app/provider-integration/model/product-run.entity';
import { ProductRunsService } from '@app/provider-integration/services/product-runs.service';
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

@Controller('product-runs')
export class ProductRunsController {
  constructor(private readonly runsService: ProductRunsService) {}

  @Post('find')
  async find(
    @Query(TransformPageRequestPipe) pageRequest: PageRequest,
    @Body() findDto: FindRunsDto,
  ): Promise<Page<ProductRun>> {
    Logger.debug(JSON.stringify(findDto));
    return await this.runsService.find(findDto, pageRequest);
  }

  @Get()
  async getAllRuns(
    @Query(TransformPageRequestPipe) pageRequest: PageRequest,
  ): Promise<Page<ProductRun>> {
    return await this.runsService.findAll(pageRequest);
  }

  @Get(':id')
  async getRun(@Param('id') id): Promise<ProductRun> {
    return await this.runsService.findOne(id);
  }
}
