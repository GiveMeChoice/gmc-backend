import { MerchantLabel } from '@app/provider-integration/model/merchant-label.entity';
import { MerchantLabelsService } from '@app/provider-integration/services/merchant-labels.service';
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
  Put,
  Query,
} from '@nestjs/common';
import { FindMerchantLabelsDto } from '../dto/find-merchant-labels.dto';
import { UpdateMerchantLabelDto } from '../dto/update-merchant-label.dto';

@Controller('merchant-labels')
export class MerchantLabelsController {
  private readonly logger = new Logger(MerchantLabelsController.name);

  constructor(private readonly merchantLabelsService: MerchantLabelsService) {}

  @Get()
  async getAll(
    @Query(TransformPageRequestPipe) pageRequest: PageRequest,
  ): Promise<Page<MerchantLabel>> {
    return await this.merchantLabelsService.findAll(pageRequest);
  }

  @Get(':id')
  async getOne(@Param('id') id): Promise<MerchantLabel> {
    return await this.merchantLabelsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateMerchantLabelDto,
  ): Promise<MerchantLabel> {
    return this.merchantLabelsService.update(id, updateDto);
  }

  @Post(':id/assign')
  async assign(
    @Param('id') id: string,
    @Query('gmcLabelId') gmcLabelId?: string,
  ): Promise<MerchantLabel> {
    this.logger.debug(`Assigning merchant label ${id} to ${gmcLabelId}`);
    return this.merchantLabelsService.assignGmcLabel(id, gmcLabelId);
  }

  @Post('find')
  async find(
    @Query(TransformPageRequestPipe) pageRequest: PageRequest,
    @Body() findDto: FindMerchantLabelsDto,
  ) {
    this.logger.debug(JSON.stringify(findDto));
    return await this.merchantLabelsService.find(findDto, pageRequest);
  }
}
