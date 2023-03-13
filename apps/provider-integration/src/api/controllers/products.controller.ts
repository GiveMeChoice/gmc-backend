import { Product } from '@app/provider-integration/model/product.entity';
import { ProductsService } from '@app/provider-integration/services/products.service';
import { TransformPageRequestPipe } from '@app/provider-integration/utils/transform-page.pipe';
import { PageRequest } from '@lib/database/interface/page-request.interface';
import { Page } from '@lib/database/interface/page.interface';
import { SearchService } from '@lib/search';
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
  private readonly logger = new Logger(ProductsController.name);

  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async getAll(
    @Query(TransformPageRequestPipe) pageRequest: PageRequest,
  ): Promise<Page<Product>> {
    return await this.productsService.findAll(pageRequest);
  }

  @Get(':id')
  async getOne(@Param('id') id): Promise<Product> {
    return await this.productsService.findOneExternal(id);
  }

  // @Get(':id/data')
  // async getOneData(@Param('id') id): Promise<Product> {
  //   return await this.productsService.findOneData(id);
  // }

  @Post(':id/index')
  async syncData(@Param('id') id): Promise<any> {
    return await this.productsService.indexProduct(id);
  }

  @Post('index')
  async syncTest(@Body() findDto: FindProductsDto) {
    await this.productsService.indexProductBatchAsync(findDto);
  }

  @Post('find')
  async find(
    @Query(TransformPageRequestPipe) pageRequest: PageRequest,
    @Body() findDto: FindProductsDto,
  ) {
    this.logger.debug(JSON.stringify(findDto));
    return await this.productsService.find(findDto, pageRequest);
  }

  @Post('search')
  search(@Query('q') q: string) {
    return this.productsService.search(q);
  }
}
