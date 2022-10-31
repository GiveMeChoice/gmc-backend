import { ProviderKey } from '@app/provider-integration/providers/model/enum/provider-key.enum';
import { ProductSource } from '@app/provider-integration/providers/model/product-source.entity';
import { SourceRun } from '@app/provider-integration/providers/model/source-run.entity';
import { ProductsService } from '@lib/products';
import { Product } from '@lib/products/model/product.entity';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { concatMap, lastValueFrom, map } from 'rxjs';
import { EXTRACTOR_FACTORY, TRANSFORMER_FACTORY } from '../../etl.constants';
import { ExtractorFactory } from '../../shared/extractor/extractor.factory';
import { Pipeline } from '../../shared/pipeline/pipeline.interface';
import { TransformerFactory } from '../../shared/transformer/transformer.factory';
import { EthicalSuperstoreExtractor } from './ethical-superstore.extractor';
import { EthicalSuperstoreTransformer } from './ethical-superstore.transformer';

@Injectable()
export class EthicalSuperstorePipeline implements Pipeline {
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

  async run(source: ProductSource): Promise<Partial<SourceRun>> {
    const run = SourceRun.factory();
    try {
      await lastValueFrom(
        // extract
        this._extractor.extractSource(source).pipe(
          map((item) => {
            run.productsFound++;
            // map
            return this._transformer.mapSourceItem(item);
          }),
          concatMap(async (product) => {
            if (
              !(await this.productsService.existsByProvider(
                this.providerKey,
                product.providerProductId,
              ))
            ) {
              // load
              product.createdBySourceRunId = run.id;
              await this.productsService.create(product);
              run.productsCreated++;
            }
          }),
        ),
      );
    } catch (err) {
      Logger.error(err);
      run.errorMessage = err.toString();
    }
    return run;
  }

  async refreshProduct(product: Product): Promise<any> {
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
      return refreshed;
    } catch (err) {
      Logger.error(err);
    }
  }
}
