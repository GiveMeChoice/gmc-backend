import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { Product } from '@app/provider-integration/model/product.entity';
import { Run } from '@app/provider-integration/model/run.entity';
import { Injectable, Logger } from '@nestjs/common';
import { concatMap, lastValueFrom } from 'rxjs';
import { PipelineBase } from '../../pipeline/pipeline.base';
import { EthicalSuperstoreExtractor } from './ethical-superstore.extractor';
import { EthicalSuperstoreLoader } from './ethical-superstore.loader';
import { EthicalSuperstoreMapper } from './ethical-superstore.mapper';

@Injectable()
export class EthicalSuperstorePipeline extends PipelineBase {
  private readonly logger = new Logger(EthicalSuperstorePipeline.name);

  providerKey: ProviderKey = ProviderKey.ETHICAL_SUPERSTORE_WEB;

  async executeInternal(run: Run) {
    this.logger.log(this.extractorContainer == null);
    try {
      run.contentDate = new Date();
      await lastValueFrom(
        (
          this.extractorContainer.getExtractor(
            this.providerKey,
          ) as EthicalSuperstoreExtractor
        )
          .extractChannel(run.channel)
          .pipe(
            concatMap(async (sourceItem) => {
              if (sourceItem.inStock) {
                const sourceProduct = (
                  this.mapperContainer.getMapper(
                    this.providerKey,
                  ) as EthicalSuperstoreMapper
                ).mapChannelItem(sourceItem);
                await (
                  this.loaderContainer.getLoader(
                    this.providerKey,
                  ) as EthicalSuperstoreLoader
                ).loadChannelItem(sourceProduct, run);
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

  async refreshProduct(product: Product, runId, reason, skipCache: boolean) {
    const extracted = await (
      this.extractorContainer.getExtractor(
        this.providerKey,
      ) as EthicalSuperstoreExtractor
    ).extractProduct(product, skipCache);

    const mapped = (
      this.mapperContainer.getMapper(
        this.providerKey,
      ) as EthicalSuperstoreMapper
    ).mapProductDetail(product, extracted.data);

    return await (
      this.loaderContainer.getLoader(
        this.providerKey,
      ) as EthicalSuperstoreLoader
    ).refreshProduct(product.id, mapped, product.channel, runId, reason);
  }
}
