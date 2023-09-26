import { Channel } from '@app/provider-integration/model/channel.entity';
import { ProductRefreshReason } from '@app/provider-integration/model/enum/product-refresh-reason.enum';
import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { Product } from '@app/provider-integration/model/product.entity';
import { Run } from '@app/provider-integration/model/run.entity';
import { RunsService } from '@app/provider-integration/services/runs.service';
import { formatErrorMessage } from '@app/provider-integration/utils/format-error-message';
import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  EXTRACTOR_CONTAINER,
  ExtractorContainer,
} from '../extractor/extractor.container';
import { LOADER_CONTAINER, LoaderContainer } from '../loader/loader.container';
import { MAPPER_CONTAINER, MapperContainer } from '../mapper/mapper.container';
import { Pipeline } from './pipeline.interface';

@Injectable()
export abstract class PipelineBase implements Pipeline {
  abstract providerKey: ProviderKey;

  @Inject()
  readonly runsService: RunsService;

  constructor(
    @Inject(EXTRACTOR_CONTAINER)
    protected extractorContainer: ExtractorContainer,
    @Inject(MAPPER_CONTAINER) protected mapperContainer: MapperContainer,
    @Inject(LOADER_CONTAINER) protected loaderContainer: LoaderContainer,
  ) {}

  async execute(channel: Channel): Promise<Run> {
    let run = await this.runsService.start(channel);
    try {
      run = await this.executeInternal(run);
    } catch (err) {
      run.errorMessage = formatErrorMessage(err);
    }
    return await this.runsService.complete(run);
  }

  abstract refreshProduct(
    product: Product,
    runId: string,
    reason: ProductRefreshReason,
    skipCache?: boolean,
  ): Promise<Product>;

  abstract executeInternal(run: Run): Promise<Run>;
}
