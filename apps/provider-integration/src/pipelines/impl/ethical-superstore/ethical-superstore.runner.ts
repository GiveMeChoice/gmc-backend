import { ProviderKey } from '@app/provider-integration/providers/model/enum/provider-key.enum';
import { ProviderSourceRun } from '@app/provider-integration/providers/model/provider-source-run.entity';
import { ProviderSource } from '@app/provider-integration/providers/model/provider-source.entity';
import { ProductsService } from '@lib/products';
import { Product } from '@lib/products/model/product.entity';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { concatMap, lastValueFrom, map } from 'rxjs';
import {
  EXTRACTOR_FACTORY,
  TRANSFORMER_FACTORY,
} from '../../pipelines.constants';
import { ExtractorFactory } from '../../shared/extractor/extractor.factory';
import { PipelineRunner } from '../../shared/runner/pipeline-runner.interface';
import { TransformerFactory } from '../../shared/transformer/transformer.factory';
import { EthicalSuperstoreExtractor } from './ethical-superstore.extractor';
import { EthicalSuperstoreTransformer } from './ethical-superstore.transformer';

@Injectable()
export class EthicalSuperstoreRunner implements PipelineRunner {
  providerKey: ProviderKey = ProviderKey.ETHICAL_SUPERSTORE;
  private readonly _extractor: EthicalSuperstoreExtractor;
  private readonly _transformer: EthicalSuperstoreTransformer;

  constructor(
    private readonly productsService: ProductsService,
    @Inject(EXTRACTOR_FACTORY) extractorFactory: ExtractorFactory,
    @Inject(TRANSFORMER_FACTORY) transformerFactory: TransformerFactory,
  ) {
    this._extractor = extractorFactory.getExtractor(
      this.providerKey,
    ) as EthicalSuperstoreExtractor;
    this._transformer = transformerFactory.getTransformer(
      this.providerKey,
    ) as EthicalSuperstoreTransformer;
  }

  async runSourcePipeline(
    source: ProviderSource,
  ): Promise<Partial<ProviderSourceRun>> {
    const run = ProviderSourceRun.factory();
    try {
      await lastValueFrom(
        this._extractor.extractSource(source).pipe(
          map((item) => {
            run.productsFound++;
            return this._transformer.mapSourceItem(item);
          }),
          concatMap(async (product) => {
            if (
              !(await this.productsService.existsByProvider(
                this.providerKey,
                product.providerId,
              ))
            ) {
              product.createdBySourceRunId = run.id;
              await this.productsService.create(product);
              run.productsCreated++;
            }
          }),
        ),
      );
    } catch (err) {
      Logger.error(err);
      run.error = err.toString();
    }
    return run;
  }

  async runProductPipeline(product: Product): Promise<any> {
    Logger.debug('pipeline started');
    try {
      const refreshed = await lastValueFrom(
        this._extractor
          .extractProduct(product)
          .pipe(
            map((extractedDto) =>
              this._transformer.mapProductDetails(extractedDto),
            ),
          ),
      );
      await this.productsService.update(product.id, { ...refreshed });
      Logger.debug('pipeline done');
      return refreshed;
    } catch (err) {
      Logger.error(err);
    }
  }
}
