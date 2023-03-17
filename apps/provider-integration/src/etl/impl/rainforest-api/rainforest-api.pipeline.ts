import { Product } from '@app/provider-integration/model/product.entity';
import { SourceRun } from '@app/provider-integration/model/source-run.entity';
import { Inject, Injectable, Logger } from '@nestjs/common';
import * as csv from 'csvtojson';
import { ProviderKey } from '../../../model/enum/provider-key.enum';
import {
  ExtractorContainer,
  EXTRACTOR_CONTAINER,
} from '../../extractor/extractor.container';
import {
  LoaderContainer,
  LOADER_CONTAINER,
} from '../../loader/loader.container';
import {
  MapperContainer,
  MAPPER_CONTAINER,
} from '../../mapper/mapper.container';
import { Pipeline } from '../../cache/pipeline/pipeline.interface';
import { RainforestApiSourceItemDto } from './dto/rainforest-api-source-item.dto';
import { RainforestApiExtractor } from './rainforest-api.extractor';
import { RainforestApiLoader } from './rainforest-api.loader';
import { RainforestApiMapper } from './rainforest-api.mapper';

@Injectable()
export class RainforestApiPipeline implements Pipeline {
  private readonly logger = new Logger(RainforestApiPipeline.name);

  providerKey: ProviderKey = ProviderKey.RAINFOREST_API;
  private readonly _extractor: RainforestApiExtractor;
  private readonly _mapper: RainforestApiMapper;
  private readonly _loader: RainforestApiLoader;

  constructor(
    @Inject(EXTRACTOR_CONTAINER) extractorFactory: ExtractorContainer,
    @Inject(MAPPER_CONTAINER) mapperContainer: MapperContainer,
    @Inject(LOADER_CONTAINER) loaderContainer: LoaderContainer,
  ) {
    this._extractor = extractorFactory.getExtractor(
      this.providerKey,
    ) as RainforestApiExtractor;
    this._mapper = mapperContainer.getMapper(
      this.providerKey,
    ) as RainforestApiMapper;
    this._loader = loaderContainer.getLoader(
      this.providerKey,
    ) as RainforestApiLoader;
  }

  async executeSource(run: SourceRun) {
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
            await this._loader.loadSourceItem(sourceProduct, run);
          }
        });
    } catch (err) {
      this.logger.error(err);
      run.errorMessage = err.toString();
    }
    return run;
  }

  async executeProduct(product: Product, runId, reason, skipCache: boolean) {
    const extracted = await this._extractor.extractProduct(product, skipCache);
    return await this._loader.loadProductDetail(
      product.id,
      this._mapper.mapProductDetail(extracted.data, product.source),
      product.source,
      runId,
      reason,
    );
  }
}
