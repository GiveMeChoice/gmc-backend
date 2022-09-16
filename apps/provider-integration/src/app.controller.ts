import { ProductsService } from '@lib/products';
import { Product } from '@lib/products/model/product.entity';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { PipelinesService } from './pipelines/pipelines.service';
import { ProviderSourceRun } from './providers/model/provider-source-run.entity';

@Controller()
export class AppController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly integrationService: PipelinesService,
  ) {}

  @Get('find-product')
  async findProduct(@Query() params: any): Promise<string> {
    const { providerKey, providerId } = params;
    return (await this.productsService.existsByProvider(
      providerKey,
      providerId,
    ))
      ? 'true'
      : 'false';
  }

  @Get('product/:id')
  async getProduct(@Param('id') id: string): Promise<Product> {
    return await this.productsService.findOne(id);
  }

  @Get('product/:id/exists')
  async existsProduct(@Param('id') id: string): Promise<string> {
    return (await this.productsService.existsById(id)) ? 'true' : 'false';
  }

  // @Get()
  // async getProducts(): Promise<Product[]> {
  //   Logger.debug('Provider Integration controller is getting your products');
  //   return await this.productsService.findAll();
  // }

  // @Post()
  // async addProduct(@Body() product: Product): Promise<Product> {
  //   return await this.productsService.create(product);
  // }

  @Get('integrate/:id')
  async integrate(@Param('id') id: string): Promise<ProviderSourceRun> {
    return await this.integrationService.integrateSourceById(id);
  }
}
