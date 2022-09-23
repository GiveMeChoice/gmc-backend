import { ProviderSourceRun } from '@app/provider-integration/providers/model/provider-source-run.entity';
import { ProviderSource } from '@app/provider-integration/providers/model/provider-source.entity';
import { ProductsService } from '@lib/products';
import { ProductStatus } from '@lib/products/model/enum/product-status.enum';
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
import { PipelineRunner } from '../../shared/runner/pipeline-runner.interface';
import { TransformerFactory } from '../../shared/transformer/transformer.factory';
import { RainforestApiSourceItemDto } from './dto/rainforest-api-source-item.dto';
import { RainforestApiExtractor } from './rainforest-api.extractor';
import { RainforestApiTransformer } from './rainforest-api.transformer';

@Injectable()
export class RainforestApiRunner implements PipelineRunner {
  providerKey: ProviderKey = ProviderKey.RAINFOREST_API;
  private readonly _extractor: RainforestApiExtractor;
  private readonly _transformer: RainforestApiTransformer;

  constructor(
    private readonly productsService: ProductsService,
    @Inject(EXTRACTOR_FACTORY) extractorFactory: ExtractorFactory,
    @Inject(TRANSFORMER_FACTORY) transformerFactory: TransformerFactory,
  ) {
    this._extractor = extractorFactory.getExtractor(
      this.providerKey,
    ) as RainforestApiExtractor;
    this._transformer = transformerFactory.getTransformer(
      this.providerKey,
    ) as RainforestApiTransformer;
  }

  async runSourcePipeline(
    source: ProviderSource,
  ): Promise<Partial<ProviderSourceRun>> {
    const run = ProviderSourceRun.factory();
    try {
      await csv()
        .fromStream(await this._extractor.extractSource(source))
        .subscribe(async (item: RainforestApiSourceItemDto) => {
          run.productsFound++;
          const product = this._transformer.mapSourceItem(item);
          if (
            !(await this.productsService.existsByProvider(
              source.provider.key,
              product.providerId,
            ))
          ) {
            product.createdBySourceRunId = run.id;
            await this.productsService.create(product);
            run.productsCreated++;
          }
        });
    } catch (err) {
      Logger.error(err);
      run.error = err.toString();
    }
    return run;
  }

  async runProductPipeline(product: Product): Promise<any> {
    const refreshed = await this._transformer.mapProductDetails(
      await this._extractor.extractProduct(product),
    );
    await this.productsService.update(product.id, { ...refreshed });
  }
}
