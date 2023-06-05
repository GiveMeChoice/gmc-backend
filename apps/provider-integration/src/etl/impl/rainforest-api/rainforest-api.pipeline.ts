import { Product } from '@app/provider-integration/model/product.entity';
import { Run } from '@app/provider-integration/model/run.entity';
import { Injectable, Logger } from '@nestjs/common';
import * as csv from 'csvtojson';
import { ProviderKey } from '../../../model/enum/provider-key.enum';
import { PipelineBase } from '../../pipeline/pipeline.base';
import { RainforestApiSourceItemDto } from './dto/rainforest-api-source-item.dto';
import { RainforestApiExtractor } from './rainforest-api.extractor';
import { RainforestApiLoader } from './rainforest-api.loader';
import { RainforestApiMapper } from './rainforest-api.mapper';

@Injectable()
export class RainforestApiPipeline extends PipelineBase {
  private readonly logger = new Logger(RainforestApiPipeline.name);

  providerKey: ProviderKey = ProviderKey.RAINFOREST_API;

  async executeInternal(run: Run) {
    try {
      const contentStream = await (
        this.extractorContainer.getExtractor(
          this.providerKey,
        ) as RainforestApiExtractor
      ).extractChannel(run.channel);

      run.contentDate = contentStream.runDate;
      await csv()
        .fromStream(contentStream.stream)
        .subscribe(async (item: RainforestApiSourceItemDto) => {
          if (
            !item.result.category_results.sponsored &&
            item.result.category_results.price.value
          ) {
            const sourceProduct = (
              this.mapperContainer.getMapper(
                this.providerKey,
              ) as RainforestApiMapper
            ).mapChannelItem(item);

            await (
              this.loaderContainer.getLoader(
                this.providerKey,
              ) as RainforestApiLoader
            ).loadChannelItem(sourceProduct, run);
          }
        });
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
      ) as RainforestApiExtractor
    ).extractProduct(product, skipCache);

    const mapped = (
      this.mapperContainer.getMapper(this.providerKey) as RainforestApiMapper
    ).mapProductDetail(product, extracted.data);

    return await (
      this.loaderContainer.getLoader(this.providerKey) as RainforestApiLoader
    ).refreshProduct(product.id, mapped, product.channel, runId, reason);
  }
}
