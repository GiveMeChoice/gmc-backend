import { ProviderProductDataDto } from '@app/provider-integration/etl/dto/provider-product-data.dto';
import { ProductRefreshReason } from '@app/provider-integration/model/enum/product-refresh-reason.enum';
import { Product } from '@app/provider-integration/model/product.entity';
import { Run } from '@app/provider-integration/model/run.entity';
import { IntegrationService } from '@app/provider-integration/services/integration.service';
import { ProductsService } from '@app/provider-integration/services/products.service';
import { Controller, Logger, Post, Query } from '@nestjs/common';

@Controller('integration')
export class IntegrationController {
  private readonly logger = new Logger(IntegrationController.name);

  constructor(
    private readonly integrationService: IntegrationService,
    private readonly productsService: ProductsService,
  ) {}

  @Post('integrate-channel')
  async integrateChannel(@Query('channelId') channelId: string): Promise<Run> {
    this.logger.debug(`Integrate provider channel ${channelId}`);
    return await this.integrationService.inegrateProviderChannel(channelId);
  }

  @Post('refresh-product')
  async integrateProduct(
    @Query('productId') productId: string,
    @Query('skipCache') skipCache: boolean,
  ): Promise<Product> {
    this.logger.debug(
      `Integrate product ${productId} ${
        skipCache ? 'AND SKIP CACHE' : 'from cache'
      }`,
    );
    await this.integrationService.refreshProduct(
      productId,
      'REST_API',
      ProductRefreshReason.REQUESTED,
      skipCache,
    );
    return this.productsService.findOne(productId);
  }

  @Post('extract-product')
  async extractProduct(
    @Query('productId') productId: string,
    @Query('skipCache') skipCache: boolean,
  ): Promise<any> {
    this.logger.debug(
      `Extract ${productId} ${skipCache ? 'AND SKIP CACHE' : 'from cache'}`,
    );
    return await this.integrationService.extractProduct(productId, skipCache);
  }

  @Post('map-product')
  async mapProduct(
    @Query('productId') productId: string,
    @Query('skipCache') skipCache: boolean,
  ): Promise<ProviderProductDataDto> {
    this.logger.debug(
      `Map ${productId} ${skipCache ? 'AND SKIP CACHE' : 'from cache'}`,
    );
    return await this.integrationService.mapProduct(productId, skipCache);
  }

  // @Post('remap-provider')
  // async remapProvider(@Query('provider') key: ProviderKey): Promise<any> {
  //   if (!key) throw new Error('provider (key) required');
  //   this.logger.debug(`Requesting Product Remap for Provider: ${key}`);
  //   return await this.etlService.remapProvider(key);
  // }
}