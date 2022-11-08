import { SourceRun } from '@app/provider-integration/model/source-run.entity';
import { IntegrationService } from '@app/provider-integration/services/integration.service';
import { Product } from '@lib/products/model/product.entity';
import { Controller, Post, Query } from '@nestjs/common';

@Controller()
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  @Post('integrate-source')
  async integrateSource(@Query('id') sourceId: string): Promise<SourceRun> {
    return await this.integrationService.inegrateSource(sourceId);
  }

  @Post('integrate-product')
  async integrateProduct(
    @Query('id') productId: string,
    @Query('skip-cache') skipCache: boolean,
  ): Promise<Product> {
    return await this.integrationService.refreshProduct(
      productId,
      'REST_API',
      skipCache,
    );
  }

  @Post('extract-product')
  async extractProduct(
    @Query('id') productId: string,
    @Query('skip-cache') skipCache: boolean,
  ): Promise<any> {
    return await this.integrationService.extractProduct(productId, skipCache);
  }

  // @Post('map-product')
  // async mapProduct(@Query('id') productId: string): Promise<any> {
  //   return await this.integrationService.mapProduct(productId);
  // }
}
