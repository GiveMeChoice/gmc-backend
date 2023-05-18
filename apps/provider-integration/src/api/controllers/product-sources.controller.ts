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
import { ProviderSource } from '../../model/provider-source.entity';
import { ProviderSourcesService } from '../../services/provider-sources.service';
import { FindSourcesDto } from '../dto/find-sources.dto';
import { UpdateSourceDto } from '../dto/update-source.dto';

@Controller('product-sources')
export class ProductSourcesController {
  private readonly logger = new Logger(ProductSourcesController.name);

  constructor(private readonly productSourcesService: ProviderSourcesService) {}

  @Post('find')
  async find(
    @Query(TransformPageRequestPipe) pageRequest: PageRequest,
    @Body() findDto: FindSourcesDto,
  ): Promise<Page<ProviderSource>> {
    this.logger.debug(JSON.stringify(findDto));
    return await this.productSourcesService.find(findDto, pageRequest);
  }

  @Get()
  async getAll(
    @Query(TransformPageRequestPipe) pageRequest: PageRequest,
  ): Promise<Page<ProviderSource>> {
    return await this.productSourcesService.findAll(pageRequest);
  }

  @Get(':id')
  async getOne(@Param('id') id): Promise<ProviderSource> {
    return await this.productSourcesService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id,
    @Body() updateDto: UpdateSourceDto,
  ): Promise<ProviderSource> {
    return this.productSourcesService.update(id, updateDto);
  }
}
