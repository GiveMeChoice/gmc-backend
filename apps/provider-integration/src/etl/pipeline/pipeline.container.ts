import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { Injectable, Logger } from '@nestjs/common';
import { Pipeline } from './pipeline.interface';

export const PIPELINE_CONTAINER = 'PIPELINE_CONTAINER';

@Injectable()
export class PipelineContainer {
  private readonly logger = new Logger(PipelineContainer.name);

  constructor(private readonly pipelines: Pipeline[]) {}

  public getPipeline(providerKey: ProviderKey): Pipeline {
    try {
      const pipeline = this.pipelines.find(
        (r) => r.providerKey === providerKey,
      );
      if (pipeline) return pipeline;
    } catch (e) {
      this.logger.error(e);
    }
    throw new Error(
      `Unable to find pipeline runner for Provider Key ${providerKey}`,
    );
  }
}
