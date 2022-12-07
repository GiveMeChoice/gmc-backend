import { ProductRun } from '@app/provider-integration/model/product-run.entity';
import { Product } from '@app/provider-integration/model/product.entity';
import { IntegrationService } from '@app/provider-integration/services/integration.service';
import { ProductsService } from '@app/provider-integration/services/products.service';
import { Controller, Logger, Post, Query } from '@nestjs/common';

@Controller()
export class IntegrationController {
  constructor(
    private readonly integrationService: IntegrationService,
    private readonly productsService: ProductsService,
  ) {}

  @Post('integrate-source')
  async integrateSource(@Query('id') sourceId: string): Promise<ProductRun> {
    return await this.integrationService.inegrateSource(sourceId);
  }

  @Post('refresh-product')
  async refreshProduct(
    @Query('id') productId: string,
    @Query('skipCache') skipCache: boolean,
  ): Promise<Product> {
    Logger.debug(
      `Refresh ${productId} ${skipCache ? 'AND SKIP CACHE' : 'from cache'}`,
    );
    await this.integrationService.refreshProduct(
      productId,
      'REST_API',
      skipCache,
    );
    return this.productsService.findOneExternal(productId);
  }

  @Post('extract-product')
  async extractProduct(
    @Query('id') productId: string,
    @Query('skipCache') skipCache: boolean,
  ): Promise<any> {
    Logger.debug(
      `Extract ${productId} ${skipCache ? 'AND SKIP CACHE' : 'from cache'}`,
    );
    return await this.integrationService.extractProduct(productId, skipCache);
  }

  @Post('map-product')
  async mapProduct(
    @Query('id') productId: string,
    @Query('skipCache') skipCache: boolean,
  ): Promise<any> {
    Logger.debug(
      `Map ${productId} ${skipCache ? 'AND SKIP CACHE' : 'from cache'}`,
    );
    return await this.integrationService.mapProduct(productId, skipCache);
  }
}
