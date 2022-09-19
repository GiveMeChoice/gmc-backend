import { ProviderSourceRun } from '@app/provider-integration/providers/model/provider-source-run.entity';
import { ProviderSource } from '@app/provider-integration/providers/model/provider-source.entity';
import { ProductsService } from '@lib/products';
import { ProductStatus } from '@lib/products/model/enum/product-status.enum';
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
    let productsFound = 0,
      productsLoaded = 0,
      errors = 0;
    const runId = uuid.v4();
    try {
      await csv()
        .fromStream(await this._extractor.extractSource(source))
        .subscribe(async (item: RainforestApiSourceItemDto) => {
          productsFound++;
          try {
            const product = this._transformer.mapSourceItem(item);
            if (
              !(await this.productsService.existsByProvider(
                source.provider.key,
                product.providerId,
              ))
            ) {
              Logger.debug(`Creating: ${product.providerId}`);
              product.createdBySourceRunId = runId;
              await this.productsService.create(product);
              productsLoaded++;
              // source => last refreshed date
              // source => last loaded date
              // run => fromCache?
              // run => cacheDate
            }
          } catch (err) {
            errors++;
          }
        });
    } catch (err) {
      Logger.error(err);
    }
    return {
      id: runId,
      productsFound,
      productsLoaded,
      errors,
    };
  }

  async runProductPipeline(providerProductId: string): Promise<any> {
    Logger.debug(`Starting rainforest pipeline - ASN: ${providerProductId}`);
    const productResponse = await this._extractor.extractProduct(
      providerProductId,
    );
    const product = await this._transformer.mapProductDetails(productResponse);
    const existing = await this.productsService.findByProvider(
      this.providerKey,
      providerProductId,
    );
    if (!existing) {
      await this.productsService.create(product);
    } else if (existing.status !== ProductStatus.COMPLETE) {
      await this.productsService.update(existing.id, { ...product });
    }
    Logger.debug(`Rainforest pipeline COMPLETE - ASN: ${providerProductId}`);
  }
}
