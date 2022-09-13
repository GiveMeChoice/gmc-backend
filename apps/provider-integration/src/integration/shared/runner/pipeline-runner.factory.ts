import { ProviderKey } from '@app/provider-integration/providers/model/enum/provider-key.enum';
import { Injectable, Logger } from '@nestjs/common';
import { PipelineRunner } from './pipeline-runner.interface';

@Injectable()
export class PipelineRunnerFactory {
  constructor(private readonly runners: PipelineRunner[]) {}

  public getRunner(providerKey: ProviderKey): PipelineRunner {
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
