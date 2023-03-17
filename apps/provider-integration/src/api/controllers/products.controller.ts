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

  constructor(
    private readonly productsService: ProductsService,
    private readonly searchService: SearchService,
  ) {}

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

  @Post(':id/index')
  async index(@Param('id') id): Promise<any> {
    this.logger.debug(`Indexing Product: ${id}`);
    return await this.productsService.indexProduct(id);
  }

  @Post(':id/index/map')
  async getIndexable(@Param('id') id): Promise<any> {
    return await this.productsService.getOneIndexable(id);
  }

  @Get(':id/index/current')
  async getCurrentlyIndexed(@Param('id') id): Promise<any> {
    if (await this.searchService.existsDocument(id)) {
      return await this.searchService.getDocument(id);
    }
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
