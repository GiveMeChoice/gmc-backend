import { ProductsService } from '@lib/products';
import { Product } from '@lib/products/model/product.entity';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  ExtractorContainer,
  EXTRACTOR_CONTAINER,
} from '../etl/shared/extractor/extractor.container';
import {
  PipelineContainer,
  PIPELINE_CONTAINER,
} from '../etl/shared/pipeline/pipeline.container';
import { ProductSourceStatus } from '../model/enum/product-source-status';
import { ProviderKey } from '../model/enum/provider-key.enum';
import { ProductSource } from '../model/product-source.entity';
import { SourceRun } from '../model/source-run.entity';
import { formatErrorMessage } from '../utils/format-error-message';
import { ProductSourcesService } from './product-sources.service';

@Injectable()
export class IntegrationService {
  constructor(
    @Inject(PIPELINE_CONTAINER)
    private readonly pipelineContainer: PipelineContainer,
    @Inject(EXTRACTOR_CONTAINER)
    private readonly extractorContainer: ExtractorContainer,
    private productSourcesService: ProductSourcesService,
    private readonly productsService: ProductsService,
  ) {}

  async inegrateSource(sourceId: string): Promise<SourceRun> {
    const source = await this.productSourcesService.findOne(sourceId);
    this.validateSource(source);
    let run = await this.productSourcesService.startRun(source);
    try {
      const pipeline = this.pipelineContainer.getPipeline(
        run.source.provider.key,
      );
      run = await pipeline.execute(run);
    } catch (err) {
      run.errorMessage = formatErrorMessage(err);
      Logger.error(
        `Source ${sourceId} Integration Failed: ${run.errorMessage}`,
      );
    }
    return await this.productSourcesService.completeRun(run);
  }

  async refreshProduct(
    productId: string,
    runId: string,
    skipCache: boolean,
  ): Promise<Product> {
    const product = await this.productsService.findOne(productId);
    if (!product) throw new Error(`Product not found: ${productId}`);
    const source = await this.productSourcesService.findOne(product.sourceId);
    try {
      const pipeline = this.pipelineContainer.getPipeline(
        product.providerKey as ProviderKey,
      );
      const updates = await pipeline.refreshProduct(
        product,
        source,
        runId,
        skipCache,
      );
      return await this.productsService.update(productId, updates);
    } catch (err) {
      product.hasIntegrationError = true;
      product.errorMessage = formatErrorMessage(err);
      Logger.error(
        `Product ${productId} Refresh Failed: ${product.errorMessage}`,
      );
      return await this.productsService.save(product);
    }
  }

  async extractProduct(productId: string, skipCache: boolean): Promise<any> {
    const product = await this.productsService.findOne(productId);
    if (!product) throw new Error(`Product not found: ${productId}`);
    const extractor = this.extractorContainer.getExtractor(
      product.providerKey as ProviderKey,
    );
    return await extractor.extractProduct(product, skipCache);
  }

  private validateSource(source: ProductSource) {
    if (!source)
      throw new HttpException('Invalid Product Source', HttpStatus.BAD_REQUEST);
    if (!source.active || !source.provider.active) {
      throw new Error(
        'Provider and/or Source is not active! Skipping integration...',
      );
    }
    if (source.status === ProductSourceStatus.BUSY) {
      throw new Error('Source is busy! Skipping integration...');
    }
  }
}
