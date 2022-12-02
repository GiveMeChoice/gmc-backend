import { Product } from '@app/provider-integration/model/product.entity';
import { ProductsService } from '@app/provider-integration/services/products.service';
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
import { FindProductsDto } from '../dto/find-products.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async getAll(
    @Query(TransformPageRequestPipe) pageRequest: PageRequest,
  ): Promise<Page<Product>> {
    return await this.productsService.findAll(pageRequest);
  }

  @Get(':id')
  async getOne(@Param('id') id): Promise<Product> {
    return await this.productsService.findOne(id);
  }

  @Post('search')
  async search(
    @Query(TransformPageRequestPipe) pageRequest: PageRequest,
    @Body() findDto: FindProductsDto,
  ) {
    Logger.debug(JSON.stringify(findDto));
    return await this.productsService.find(findDto, pageRequest);
  }
}