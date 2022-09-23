import { ProductsService } from '@lib/products';
import { Product } from '@lib/products/model/product.entity';
import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PipelinesService } from './pipelines/pipelines.service';
import { ProviderKey } from './providers/model/enum/provider-key.enum';
import { ProviderSourceRun } from './providers/model/provider-source-run.entity';

@Controller()
export class AppController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly pipelinesService: PipelinesService,
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

  @Post('integrate-source')
  async integrateSource(@Query('id') id: string): Promise<ProviderSourceRun> {
    return await this.pipelinesService.runSourcePipelineById(id);
  }

  @Post('integrate-product')
  async integrateProduct(@Query('id') id: string): Promise<ProviderSourceRun> {
    return await this.pipelinesService.runProductPipelineById(id);
  }
}
