import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { Injectable, Logger } from '@nestjs/common';
import { Pipeline } from './pipeline.interface';

@Injectable()
export class PipelineFactory {
  constructor(private readonly runners: Pipeline[]) {}

  public getPipeline(providerKey: ProviderKey): Pipeline {
    try {
      const runner = this.runners.find((r) => r.providerKey === providerKey);
      if (runner) return runner;
    } catch (e) {
      Logger.error(e);
    }
    throw new Error(
      `Unable to find pipeline runner for Provider Key ${providerKey}`,
    );
  }
}
