import {
  ExtractorContainer,
  EXTRACTOR_CONTAINER,
} from '@app/provider-integration/etl/shared/extractor/extractor.container';
import { ProductRun } from '@app/provider-integration/model/product-run.entity';
import { Product } from '@app/provider-integration/model/product.entity';
import { IntegrationService } from '@app/provider-integration/services/integration.service';
import { ProductSourcesService } from '@app/provider-integration/services/product-sources.service';
import { Controller, Inject, Logger, Post, Query } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

@Controller()
export class IntegrationController {
  constructor(
    private readonly integrationService: IntegrationService,
    @Inject(EXTRACTOR_CONTAINER)
    private readonly extractorContainer: ExtractorContainer,
    private readonly sourcesService: ProductSourcesService,
  ) {}

  @Post('integrate-source')
  async integrateSource(@Query('id') sourceId: string): Promise<ProductRun> {
    return await this.integrationService.inegrateSource(sourceId);
  }

  @Post('refresh-product')
  async refreshProduct(
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

  @Post('map-product')
  async mapProduct(
    @Query('id') productId: string,
    @Query('skip-cache') skipCache: boolean,
  ): Promise<any> {
    return await this.integrationService.mapProduct(productId, skipCache);
  }
}
