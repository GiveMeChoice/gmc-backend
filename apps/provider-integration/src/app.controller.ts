import { Product } from '@lib/products/model/product.entity';
import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { PipelineResult } from './integration/model/pipeline-result.entity';
import { IntegrationService } from './integration/services/integration.service';
import { ProviderKey } from './providers/model/enum/provider-key.enum';

@Controller()
export class AppController {
  constructor(private readonly integrationService: IntegrationService) {}

  // @Get()
  // async getProducts(): Promise<Product[]> {
  //   Logger.debug('Provider Integration controller is getting your products');
  //   return await this.productsService.findAll();
  // }

  // @Post()
  // async addProduct(@Body() product: Product): Promise<Product> {
  //   return await this.productsService.create(product);
  // }

  @Get('integrate')
  async integrate(): Promise<PipelineResult> {
    return await this.integrationService.integrateSourceById(
      '01ac267a-e356-47dc-a97d-8da1407134e9',
    );
  }
}
