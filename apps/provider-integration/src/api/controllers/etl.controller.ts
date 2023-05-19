import { ProviderProductDataDto } from '@app/provider-integration/etl/dto/provider-product-data.dto';
import { ProductRefreshReason } from '@app/provider-integration/model/enum/product-refresh-reason.enum';
import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { Product } from '@app/provider-integration/model/product.entity';
import { Run } from '@app/provider-integration/model/run.entity';
import { EtlService } from '@app/provider-integration/services/etl.service';
import { ProductsService } from '@app/provider-integration/services/products.service';
import { Controller, Logger, Post, Query } from '@nestjs/common';

@Controller('etl')
export class EtlController {
  private readonly logger = new Logger(EtlController.name);

  constructor(
    private readonly etlService: EtlService,
    private readonly productsService: ProductsService,
  ) {}

  @Post('integrate-source')
  async integrateSource(@Query('id') sourceId: string): Promise<Run> {
    this.logger.debug(`Integrate source ${sourceId}`);
    return await this.etlService.inegrateSource(sourceId);
  }

  @Post('integrate-product')
  async integrateProduct(
    @Query('id') productId: string,
    @Query('skipCache') skipCache: boolean,
  ): Promise<Product> {
    this.logger.debug(
      `Integrate product ${productId} ${
        skipCache ? 'AND SKIP CACHE' : 'from cache'
      }`,
    );
    await this.etlService.integrateProduct(
      productId,
      'REST_API',
      ProductRefreshReason.REQUESTED,
      skipCache,
    );
    return this.productsService.findOneExternal(productId);
  }

  @Post('extract-product')
  async extractProduct(
    @Query('id') productId: string,
    @Query('skipCache') skipCache: boolean,
  ): Promise<any> {
    this.logger.debug(
      `Extract ${productId} ${skipCache ? 'AND SKIP CACHE' : 'from cache'}`,
    );
    return await this.etlService.extractProduct(productId, skipCache);
  }

  @Post('map-product')
  async mapProduct(
    @Query('id') productId: string,
    @Query('skipCache') skipCache: boolean,
  ): Promise<ProviderProductDataDto> {
    this.logger.debug(
      `Map ${productId} ${skipCache ? 'AND SKIP CACHE' : 'from cache'}`,
    );
    return await this.etlService.mapProduct(productId, skipCache);
  }

  @Post('remap-provider')
  async remapProvider(@Query('provider') key: ProviderKey): Promise<any> {
    if (!key) throw new Error('provider (key) required');
    this.logger.debug(`Requesting Product Remap for Provider: ${key}`);
    return await this.etlService.remapProvider(key);
  }
}
