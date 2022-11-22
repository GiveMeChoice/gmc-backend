import { TransformPageRequestPipe } from '@app/provider-integration/utils/transform-page.pipe';
import { PageRequest } from '@lib/database/interface/page-request.interface';
import { Body, Controller, Get, Logger, Param, Query } from '@nestjs/common';
import { ProductSource } from '../../model/product-source.entity';
import { ProductSourcesService } from '../../services/product-sources.service';
import { FindSourcesDto } from '../dto/find-sources.dto';

@Controller('product-sources')
export class ProductSourcesController {
  constructor(private readonly productSourcesService: ProductSourcesService) {}

  @Get()
  async find(
    @Query(TransformPageRequestPipe) pageRequest: PageRequest,
    @Body() findDto: FindSourcesDto,
  ): Promise<ProductSource[]> {
    Logger.debug(JSON.stringify(JSON.stringify(pageRequest)));
    return await this.productSourcesService.find(findDto, pageRequest);
  }

  @Get(':id')
  async getOne(@Param('id') id): Promise<ProductSource> {
    return await this.productSourcesService.findOne(id);
  }
}
