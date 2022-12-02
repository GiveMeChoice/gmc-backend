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
import {
  TransformerContainer,
  TRANSFORMER_CONTAINER,
} from '../etl/shared/transformer/transformer.container';
import { ProductIntegrationStatus } from '../model/enum/product-status.enum';
import { ProductRun } from '../model/product-run.entity';
import { ProductSource } from '../model/product-source.entity';
import { Product } from '../model/product.entity';
import { formatErrorMessage } from '../utils/format-error-message';
import { renewExpirationDate } from '../utils/renew-expiration-date';
import { ProductSourcesService } from './product-sources.service';
import { ProductsService } from './products.service';

@Injectable()
export class IntegrationService {
  constructor(
    @Inject(PIPELINE_CONTAINER)
    private readonly pipelineContainer: PipelineContainer,
    @Inject(EXTRACTOR_CONTAINER)
    private readonly extractorContainer: ExtractorContainer,
    @Inject(TRANSFORMER_CONTAINER)
    private readonly transformerContainer: TransformerContainer,
    private productSourcesService: ProductSourcesService,
    private readonly productsService: ProductsService,
  ) {}

  async inegrateSource(sourceId: string): Promise<ProductRun> {
    const source = await this.productSourcesService.findOne(sourceId);
    this.validateSource(source);
    Logger.debug(
      `Ingegrating Source: ${source.provider.key} - ${source.identifier}`,
    );
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
    let product = await this.productsService.findOne(productId);
    if (!product) throw new Error(`Product not found: ${productId}`);
    try {
      const pipeline = this.pipelineContainer.getPipeline(product.provider.key);
      product = await this.productsService.update(
        productId,
        await pipeline.refreshProduct(product, skipCache),
      );
      product.hasIntegrationError = false;
      product.errorMessage = null;
      product.refreshedAt = new Date();
      product.expiresAt = renewExpirationDate(product.source);
      product.refreshedByRunId = runId;
      product.integrationStatus = ProductIntegrationStatus.LIVE;
    } catch (err) {
      product.hasIntegrationError = true;
      product.errorMessage = formatErrorMessage(err);
      Logger.error(
        `Product ${productId} Refresh Failed: ${product.errorMessage}`,
      );
    }
    return await this.productsService.save(product);
  }

  async extractProduct(productId: string, skipCache: boolean): Promise<any> {
    const product = await this.productsService.findOne(productId);
    if (!product) throw new Error(`Product not found: ${productId}`);
    const extractor = this.extractorContainer.getExtractor(
      product.provider.key,
    );
    return await extractor.extractProduct(product, skipCache);
  }

  async mapProduct(productId: string, skipCache: boolean): Promise<any> {
    const product = await this.productsService.findOne(productId);
    if (!product) throw new Error(`Product not found: ${productId}`);
    const extractor = this.extractorContainer.getExtractor(
      product.provider.key,
    );
    const mapper = this.transformerContainer.getTransformer(
      product.provider.key,
    );
    return mapper.mapProductDetails(
      await extractor.extractProduct(product, skipCache),
    );
  }

  private validateSource(source: ProductSource) {
    if (!source)
      throw new HttpException('Invalid Product Source', HttpStatus.BAD_REQUEST);
    if (!source.active || !source.provider.active) {
      throw new Error(
        'Provider and/or Source is not active! Skipping integration...',
      );
    }
  }
}
