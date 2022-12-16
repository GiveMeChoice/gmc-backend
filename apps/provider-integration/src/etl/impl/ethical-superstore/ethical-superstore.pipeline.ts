import { ProductRefreshDto } from '@app/provider-integration/model/dto/product-data.dto';
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
  MapperContainer,
  MAPPER_CONTAINER,
} from '../../shared/mapper/source-mapper.container';
import { EthicalSuperstoreExtractor } from './ethical-superstore.extractor';
import { EthicalSuperstoreMapper } from './ethical-superstore.mapper';

@Injectable()
export class EthicalSuperstorePipeline extends PipelineBase {
  providerKey: ProviderKey = ProviderKey.ETHICAL_SUPERSTORE;
  private readonly _extractor: EthicalSuperstoreExtractor;
  private readonly _mapper: EthicalSuperstoreMapper;

  constructor(
    @Inject(EXTRACTOR_CONTAINER) extractorFactory: ExtractorContainer,
    @Inject(MAPPER_CONTAINER) mapperContainer: MapperContainer,
  ) {
    super();
    this._extractor = extractorFactory.getExtractor(
      this.providerKey,
    ) as EthicalSuperstoreExtractor;
    this._mapper = mapperContainer.getMapper(
      this.providerKey,
    ) as EthicalSuperstoreMapper;
  }

  async execute(run: ProductRun): Promise<ProductRun> {
    try {
      run.sourceDate = new Date();
      await lastValueFrom(
        this._extractor.extractSource(run.source).pipe(
          concatMap(async (sourceItem) => {
            if (sourceItem.inStock) {
              const sourceProduct = this._mapper.mapSourceItem(sourceItem);
              await this.loadSourceProduct(sourceProduct, run);
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
    if (sourceProduct.price && sourceProduct.price != existingProduct.price) {
      Logger.debug(
        `Product ${existingProduct.shortId} is stale b/c price ${existingProduct.price} vs. source price ${sourceProduct.price}`,
      );
      return true;
    } else {
      return false;
    }
  }

  async refreshProduct(
    product: Product,
    skipCache: boolean,
  ): Promise<ProductRefreshDto> {
    const extracted = await this._extractor.extractProduct(product, skipCache);
    return {
      sourceDate: extracted.sourceDate,
      ...(await this._mapper.mapProductData(extracted.data, product.source)),
    };
  }
}
