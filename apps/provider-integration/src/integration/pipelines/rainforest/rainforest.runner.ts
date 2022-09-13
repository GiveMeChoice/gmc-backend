import { ProductsService } from '@app/products';
import { Product } from '@app/products/model/product.entity';
import { ProductSource } from '@app/provider-integration/providers/model/product-source.entity';
import { Inject, Injectable, Logger } from '@nestjs/common';
import * as csv from 'csvtojson';
import { ProviderKey } from '../../../providers/model/enum/provider-key.enum';
import {
  EXTRACTOR_FACTORY,
  TRANSFORMER_FACTORY,
} from '../../constants/integration.tokens';
import { PipelineResult } from '../../model/pipeline-result.entity';
import { ExtractorFactory } from '../../shared/extract/extractor.factory';
import { PipelineRunnerBase } from '../../shared/runner/pipeline-runner.base';
import { TransformerFactory } from '../../shared/transform/transformer.factory';
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

  async runListPipelineInternal(
    source: ProductSource,
  ): Promise<Partial<PipelineResult>> {
    let productsFound = 0,
      productsLoaded = 0;
    await csv()
      .fromStream(
        // Extract
        await this.extractor.extractSource(source),
      )
      .subscribe(async (item: RainforestCategoryItem, lineNumber) => {
        // Transform
        Logger.debug(lineNumber);
        productsFound++;
        Logger.debug(JSON.stringify(item));
        const product = this.transformer.fromSourceItem(item);
        // Load
        const existing = await this.productsService.findByProviderId(
          source.provider.id,
          product.providerProductId,
        );
        if (!existing) {
          product.providerId = source.provider.id;
          const created = await this.productsService.create(product);
          productsLoaded++;
          Logger.debug(`Product ${product.providerProductId} created`);
          this.refresh(created);
        }
      });
    return {
      productsFound,
      productsLoaded,
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

// function delay(ms) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }
