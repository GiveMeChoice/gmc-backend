import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { ProductSource } from '@app/provider-integration/model/product-source.entity';
import { SourceRun } from '@app/provider-integration/model/source-run.entity';
import { ProductIntegrationStatus } from '@lib/products/model/enum/product-status.enum';
import { Product } from '@lib/products/model/product.entity';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { concatMap, lastValueFrom, map } from 'rxjs';
import {
  ExtractorContainer,
  EXTRACTOR_CONTAINER,
} from '../../shared/extractor/extractor.container';
import { PipelineBase } from '../../shared/pipeline/pipeline.base';
import {
  TransformerContainer,
  TRANSFORMER_CONTAINER,
} from '../../shared/transformer/transformer.container';
import { EthicalSuperstoreExtractor } from './ethical-superstore.extractor';
import { EthicalSuperstoreTransformer } from './ethical-superstore.transformer';

@Injectable()
export class EthicalSuperstorePipeline extends PipelineBase {
  providerKey: ProviderKey = ProviderKey.ETHICAL_SUPERSTORE;
  private readonly _extractor: EthicalSuperstoreExtractor;
  private readonly _transformer: EthicalSuperstoreTransformer;

  constructor(
    @Inject(EXTRACTOR_CONTAINER) extractorFactory: ExtractorContainer,
    @Inject(TRANSFORMER_CONTAINER) transformerFactory: TransformerContainer,
  ) {
    super();
    this._extractor = extractorFactory.getExtractor(
      this.providerKey,
    ) as EthicalSuperstoreExtractor;
    this._transformer = transformerFactory.getTransformer(
      this.providerKey,
    ) as EthicalSuperstoreTransformer;
  }

  async execute(run: SourceRun): Promise<SourceRun> {
    try {
      await lastValueFrom(
        this._extractor.extractSource(run.source).pipe(
          map((item) => {
            return this._transformer.mapSourceItem(item);
          }),
          concatMap(async (sourceProduct) => {
            run = await this.loadSourceProduct(sourceProduct, run);
          }),
        ),
      );
    } catch (err) {
      Logger.error(err);
      run.errorMessage = err.toString();
    }
    return run;
  }

  protected applySourceUpdate(
    existing: Product,
    source: Partial<Product>,
  ): Product {
    existing.price = source.price;
    return existing;
  }

  protected needsRefresh(
    sourceProduct: Partial<Product>,
    existingProduct: Product,
  ): boolean {
    return sourceProduct.price && sourceProduct.price != existingProduct.price;
  }

  async refreshProduct(
    product: Product,
    source: ProductSource,
    runId: string,
    skipCache: boolean,
  ): Promise<any> {
    const refreshed = await lastValueFrom(
      this._extractor
        .extractProduct(product, skipCache)
        .pipe(
          map((extractedDto) =>
            this._transformer.mapProductDetails(extractedDto),
          ),
        ),
    );
    refreshed.integrationStatus = ProductIntegrationStatus.LIVE;
    refreshed.hasIntegrationError = false;
    refreshed.errorMessage = null;
    refreshed.refreshedByRunId = runId;
    refreshed.refreshedAt = new Date();
    refreshed.expiresAt = super.renewExpirationDate(source);
    return refreshed;
  }
}
