import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { Product } from '@app/provider-integration/model/product.entity';
import { Run } from '@app/provider-integration/model/run.entity';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { concatMap, lastValueFrom } from 'rxjs';
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
import { Pipeline } from '../../pipeline/pipeline.interface';
import { EthicalSuperstoreExtractor } from './ethical-superstore.extractor';
import { EthicalSuperstoreLoader } from './ethical-superstore.loader';
import { EthicalSuperstoreMapper } from './ethical-superstore.mapper';

@Injectable()
export class EthicalSuperstorePipeline implements Pipeline {
  private readonly logger = new Logger(EthicalSuperstorePipeline.name);

  providerKey: ProviderKey = ProviderKey.ETHICAL_SUPERSTORE_WEB;
  private readonly _extractor: EthicalSuperstoreExtractor;
  private readonly _mapper: EthicalSuperstoreMapper;
  private readonly _loader: EthicalSuperstoreLoader;

  constructor(
    @Inject(EXTRACTOR_CONTAINER) extractorFactory: ExtractorContainer,
    @Inject(MAPPER_CONTAINER) mapperContainer: MapperContainer,
    @Inject(LOADER_CONTAINER) LoaderContainer: LoaderContainer,
  ) {
    this._extractor = extractorFactory.getExtractor(
      this.providerKey,
    ) as EthicalSuperstoreExtractor;
    this._mapper = mapperContainer.getMapper(
      this.providerKey,
    ) as EthicalSuperstoreMapper;
    this._loader = LoaderContainer.getLoader(
      this.providerKey,
    ) as EthicalSuperstoreLoader;
  }

  async executeChannel(run: Run) {
    try {
      run.contentDate = new Date();
      await lastValueFrom(
        this._extractor.extractChannel(run.channel).pipe(
          concatMap(async (sourceItem) => {
            if (sourceItem.inStock) {
              const sourceProduct = this._mapper.mapChannelItem(sourceItem);
              await this._loader.loadChannelItem(sourceProduct, run);
            }
          }),
        ),
      );
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
      this._mapper.mapProductDetail(extracted.data, product.channel),
      product.channel,
      runId,
      reason,
    );
  }
}
