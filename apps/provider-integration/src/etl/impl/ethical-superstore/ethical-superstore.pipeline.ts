import {
  ProductDataDto,
  ProductRefreshDto,
} from '@app/provider-integration/model/dto/product-data.dto';
import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { ProductRun } from '@app/provider-integration/model/product-run.entity';
import { ProductSource } from '@app/provider-integration/model/product-source.entity';
import { Product } from '@app/provider-integration/model/product.entity';
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

  async execute(run: ProductRun): Promise<ProductRun> {
    try {
      run.sourceDate = new Date();
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

  protected applySourceRefresh(
    existing: Product,
    source: Partial<Product>,
  ): Product {
    existing.price = source.price;
    return existing;
  }

  protected isProductStale(
    existingProduct: Product,
    sourceProduct: Partial<Product>,
    source: ProductSource,
  ): boolean {
    return sourceProduct.price && sourceProduct.price != existingProduct.price;
  }

  async refreshProduct(
    product: Product,
    skipCache: boolean,
  ): Promise<ProductRefreshDto> {
    const extracted = await this._extractor.extractProduct(product, skipCache);
    return {
      sourceDate: extracted.sourceDate,
      ...(await this._transformer.mapProductData(extracted.data)),
    };
  }
}
