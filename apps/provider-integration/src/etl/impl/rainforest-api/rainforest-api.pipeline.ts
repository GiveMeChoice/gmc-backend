import { ProductRefreshDto } from '@app/provider-integration/model/dto/product-data.dto';
import { ProductRun } from '@app/provider-integration/model/product-run.entity';
import { Product } from '@app/provider-integration/model/product.entity';
import { Inject, Injectable, Logger } from '@nestjs/common';
import * as csv from 'csvtojson';
import { ProviderKey } from '../../../model/enum/provider-key.enum';
import {
  ExtractorContainer,
  EXTRACTOR_CONTAINER,
} from '../../shared/extractor/extractor.container';
import {
  MapperContainer,
  MAPPER_CONTAINER,
} from '../../shared/mapper/source-mapper.container';
import { PipelineBase } from '../../shared/pipeline/pipeline.base';
import { RainforestApiSourceItemDto } from './dto/rainforest-api-source-item.dto';
import { RainforestApiExtractor } from './rainforest-api.extractor';
import { RainforestApiMapper } from './rainforest-api.mapper';

@Injectable()
export class RainforestApiPipeline extends PipelineBase {
  providerKey: ProviderKey = ProviderKey.RAINFOREST_API;
  private readonly _extractor: RainforestApiExtractor;
  private readonly _mapper: RainforestApiMapper;

  constructor(
    @Inject(EXTRACTOR_CONTAINER) extractorFactory: ExtractorContainer,
    @Inject(MAPPER_CONTAINER) mapperContainer: MapperContainer,
  ) {
    super();
    this._extractor = extractorFactory.getExtractor(
      this.providerKey,
    ) as RainforestApiExtractor;
    this._mapper = mapperContainer.getMapper(
      this.providerKey,
    ) as RainforestApiMapper;
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
            const sourceProduct = this._mapper.mapSourceItem(item);
            await super.loadSourceProduct(sourceProduct, run);
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
    if (sourceProduct.price && sourceProduct.price != existingProduct.price) {
      Logger.debug(
        `Product ${existingProduct.shortId} is stale b/c price ${existingProduct.price} vs. source price ${sourceProduct.price}`,
      );
      return true;
    } else {
      return false;
    }
  }

  protected applySourceRefresh(existing: Product, source: Partial<Product>) {
    existing.price = source.price;
    return existing;
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
