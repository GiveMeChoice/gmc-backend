import { ProductRun } from '@app/provider-integration/model/product-run.entity';
import { Product } from '@app/provider-integration/model/product.entity';
import { Inject, Injectable, Logger } from '@nestjs/common';
import * as csv from 'csvtojson';
import { ProviderKey } from '../../../model/enum/provider-key.enum';
import {
  ExtractorContainer,
  EXTRACTOR_CONTAINER,
} from '../../shared/extractor/extractor.container';
import { PipelineBase } from '../../shared/pipeline/pipeline.base';
import {
  TransformerContainer,
  TRANSFORMER_CONTAINER,
} from '../../shared/transformer/transformer.container';
import { RainforestApiSourceItemDto } from './dto/rainforest-api-source-item.dto';
import { RainforestApiExtractor } from './rainforest-api.extractor';
import { RainforestApiTransformer } from './rainforest-api.transformer';

@Injectable()
export class RainforestApiPipeline extends PipelineBase {
  providerKey: ProviderKey = ProviderKey.RAINFOREST_API;
  private readonly _extractor: RainforestApiExtractor;
  private readonly _transformer: RainforestApiTransformer;

  constructor(
    @Inject(EXTRACTOR_CONTAINER) extractorFactory: ExtractorContainer,
    @Inject(TRANSFORMER_CONTAINER) transformerFactory: TransformerContainer,
  ) {
    super();
    this._extractor = extractorFactory.getExtractor(
      this.providerKey,
    ) as RainforestApiExtractor;
    this._transformer = transformerFactory.getTransformer(
      this.providerKey,
    ) as RainforestApiTransformer;
  }

  async execute(run: ProductRun): Promise<ProductRun> {
    try {
      const sourceStream = await this._extractor.extractSource(run.source);
      run.sourceDate = sourceStream.runDate;
      await csv()
        .fromStream(sourceStream.stream)
        .subscribe(async (item: RainforestApiSourceItemDto) => {
          if (
            // only pull items from source that have a listed price and are not sponsored
            !item.result.category_results.sponsored &&
            item.result.category_results.price.value
          ) {
            const sourceProduct = this._transformer.mapSourceItem(item);
            run = await super.loadSourceProduct(sourceProduct, run);
          }
        });
    } catch (err) {
      Logger.error(err);
      run.errorMessage = err.toString();
    }
    return run;
  }

  protected isProductStale(
    sourceProduct: Partial<Product>,
    existingProduct: Product,
  ): boolean {
    return sourceProduct.price && sourceProduct.price != existingProduct.price;
  }

  protected applySourceRefresh(existing: Product, source: Partial<Product>) {
    existing.price = source.price;
    return existing;
  }

  async refreshProduct(
    product: Product,
    skipCache: boolean,
  ): Promise<Partial<Product>> {
    return await this._transformer.mapProductDetails(
      await this._extractor.extractProduct(product, skipCache),
    );
  }
}
