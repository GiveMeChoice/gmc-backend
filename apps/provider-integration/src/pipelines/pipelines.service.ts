import { ProviderKey } from '@app/provider-integration/providers/model/enum/provider-key.enum';
import { ProviderSource } from '@app/provider-integration/providers/model/provider-source.entity';
import { ProviderSourcesService } from '@app/provider-integration/providers/services/provider-sources.service';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ProviderSourceRun } from '../providers/model/provider-source-run.entity';
import { RUNNER_FACTORY } from './pipelines.constants';
import { PipelineRunnerFactory } from './shared/runner/pipeline-runner.factory';

@Injectable()
export class PipelinesService {
  constructor(
    private readonly productSourcesService: ProviderSourcesService,
    @Inject(RUNNER_FACTORY)
    private readonly pipelineRunnerFactory: PipelineRunnerFactory,
  ) {}

  async integrateSourceById(sourceId: string): Promise<ProviderSourceRun> {
    const source = await this.productSourcesService.findOne(sourceId);
    return this.integrateSource(source);
  }

  async integrateSource(source: ProviderSource): Promise<ProviderSourceRun> {
    Logger.debug(source);
    const runner = this.pipelineRunnerFactory.getRunner(source.provider.key);
    return await runner.runSourcePipeline(source);
  }

  async refreshProduct(provider: ProviderKey, productId: string) {
    // do nothing
  }
}
