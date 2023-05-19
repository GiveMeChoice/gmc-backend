import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  PIPELINE_CONTAINER,
  PipelineContainer,
} from '../etl/pipeline/pipeline.container';
import { ProviderProductDataDto } from '../etl/dto/provider-product-data.dto';
import {
  EXTRACTOR_CONTAINER,
  ExtractorContainer,
} from '../etl/extractor/extractor.container';
import {
  MAPPER_CONTAINER,
  MapperContainer,
} from '../etl/mapper/mapper.container';
import { ProductRefreshReason } from '../model/enum/product-refresh-reason.enum';
import { ProviderKey } from '../model/enum/provider-key.enum';
import { Run } from '../model/run.entity';
import { Product } from '../model/product.entity';
import { formatErrorMessage } from '../utils/format-error-message';
import { ChannelsService } from './channels.service';
import { ProductsService } from './products.service';
import { ProvidersService } from './providers.service';

@Injectable()
export class EtlService {
  private readonly logger = new Logger(EtlService.name);

  constructor(
    @Inject(PIPELINE_CONTAINER)
    private readonly pipelineContainer: PipelineContainer,
    @Inject(EXTRACTOR_CONTAINER)
    private readonly extractorContainer: ExtractorContainer,
    @Inject(MAPPER_CONTAINER)
    private readonly mapperContainer: MapperContainer,
    private readonly productSourcesService: ChannelsService,
    private readonly productsService: ProductsService,
    private readonly providersService: ProvidersService,
  ) {}

  async inegrateSource(sourceId: string): Promise<Run> {
    const source = await this.productSourcesService.findOne(sourceId);
    let run = await this.productSourcesService.startRun(source);
    this.logger.debug(
      `Ingegrating Source: ${source.provider.key} - ${source.id} `,
    );
    try {
      const pipeline = this.pipelineContainer.getPipeline(
        run.channel.provider.key,
      );
      run = await pipeline.executeChannel(run);
    } catch (err) {
      run.errorMessage = formatErrorMessage(err);
      this.logger.error(
        `Source ${sourceId} Integration Failed: ${run.errorMessage}`,
      );
    }
    return await this.productSourcesService.completeRun(run);
  }

  async integrateProduct(
    productId: string,
    runId: string,
    reason: ProductRefreshReason,
    skipCache?: boolean,
  ): Promise<Product> {
    const product = await this.productsService.findOne(productId);
    if (!product) throw new Error(`Product not found: ${productId}`);
    try {
      const pipeline = this.pipelineContainer.getPipeline(
        product.channel.provider.key,
      );
      return (await pipeline.executeProduct(product, runId, reason)) as Product;
    } catch (err) {
      return await this.productsService.update(productId, {
        errorMessage: formatErrorMessage(err),
      });
    }
  }

  async extractProduct(productId: string, skipCache: boolean): Promise<any> {
    const product = await this.productsService.findOne(productId);
    if (!product) throw new Error(`Product not found: ${productId}`);
    const extractor = this.extractorContainer.getExtractor(
      product.channel.provider.key,
    );
    return await extractor.extractProduct(product, skipCache);
  }

  async mapProduct(
    productId: string,
    skipCache?: boolean,
  ): Promise<ProviderProductDataDto> {
    const product = await this.productsService.findOne(productId);
    if (!product) throw new Error(`Product not found: ${productId}`);
    const extractor = this.extractorContainer.getExtractor(
      product.channel.provider.key,
    );
    const mapper = this.mapperContainer.getMapper(product.channel.provider.key);
    return await mapper.mapProductDetail(
      (
        await extractor.extractProduct(product, skipCache)
      ).data,
      product.channel,
    );
  }

  async remapProvider(key: ProviderKey): Promise<number> {
    const provider = await this.providersService.findOneByKey(key);
    this.logger.debug(JSON.stringify(provider));
    if (!provider || !provider.id) {
      throw new Error(`Provider ${key} does not exist!`);
    } else {
      return await this.productsService.setToRemapByProvider(provider.id);
    }
  }
}
