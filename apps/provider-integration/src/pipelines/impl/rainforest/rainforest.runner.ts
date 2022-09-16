import { ProviderSourceRun } from '@app/provider-integration/providers/model/provider-source-run.entity';
import { ProviderSource } from '@app/provider-integration/providers/model/provider-source.entity';
import { ProductsService } from '@lib/products';
import { Product } from '@lib/products/model/product.entity';
import { Inject, Injectable, Logger } from '@nestjs/common';
import * as csv from 'csvtojson';
import * as uuid from 'uuid';
import { ProviderKey } from '../../../providers/model/enum/provider-key.enum';
import {
  EXTRACTOR_FACTORY,
  TRANSFORMER_FACTORY,
} from '../../pipelines.constants';
import { ExtractorFactory } from '../../shared/extractor/extractor.factory';
import { PipelineRunnerBase } from '../../shared/runner/pipeline-runner.base';
import { TransformerFactory } from '../../shared/transformer/transformer.factory';
import { RainforestCategoryItem } from './dto/rainforest-category-item.dto';
import { RainforestExtractor } from './rainforest.extractor';
import { RainforestTransformer } from './rainforest.transformer';

@Injectable()
export class RainforestRunner extends PipelineRunnerBase {
  providerKey: ProviderKey = ProviderKey.RAINFOREST_API;
  extractor: RainforestExtractor;
  transformer: RainforestTransformer;

  constructor(
    private readonly productsService: ProductsService,
    @Inject(EXTRACTOR_FACTORY) extractorFactory: ExtractorFactory,
    @Inject(TRANSFORMER_FACTORY) transformerFactory: TransformerFactory,
  ) {
    super();
    this.extractor = extractorFactory.getExtractor(
      this.providerKey,
    ) as RainforestExtractor;
    this.transformer = transformerFactory.getTransformer(
      this.providerKey,
    ) as RainforestTransformer;
    Logger.debug(this.extractor);
    Logger.debug(this.transformer);
  }

  async runSourcePipelineInternal(
    source: ProviderSource,
  ): Promise<Partial<ProviderSourceRun>> {
    let productsFound = 0,
      productsLoaded = 0,
      errors = 0;
    const id = uuid.v4();
    try {
      await csv()
        .fromStream(await this.extractor.extractSource(source))
        .subscribe(async (item: RainforestCategoryItem, lineNumber) => {
          productsFound++;
          try {
            const product = this.transformer.fromSourceItem(item);
            const existing = await this.productsService.findByProvider(
              source.provider.key,
              product.providerProductId,
            );
            if (!existing) {
              await this.productsService.create(product);
              productsLoaded++;
            }
          } catch (err) {
            errors++;
          }
        });
    } catch (err) {
      Logger.error(err);
    }
    return {
      id,
      productsFound,
      productsLoaded,
      errors,
    };
  }

  async refresh(product: Product): Promise<void> {
    const refreshedProduct = await this.transformer.fromProductDetail(
      await this.extractor.extractDetail(product),
    );
    const updated = await this.productsService.update(
      product.id,
      refreshedProduct,
    );
    Logger.debug(updated);
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
