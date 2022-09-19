import { ProviderKey } from '@app/provider-integration/providers/model/enum/provider-key.enum';
import { ProviderSource } from '@app/provider-integration/providers/model/provider-source.entity';
import { ProviderSourcesService } from '@app/provider-integration/providers/services/provider-sources.service';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ProviderSourceRun } from '../providers/model/provider-source-run.entity';
import { ProviderSourceRunsService } from '../providers/services/provider-source-runs.service';
import { RUNNER_FACTORY } from './pipelines.constants';
import { PipelineRunnerFactory } from './shared/runner/pipeline-runner.factory';

@Injectable()
export class PipelinesService {
  constructor(
    private readonly sourcesService: ProviderSourcesService,
    private readonly runsService: ProviderSourceRunsService,
    @Inject(RUNNER_FACTORY)
    private readonly pipelineRunnerFactory: PipelineRunnerFactory,
  ) {}

  async runSourcePipelineById(sourceId: string): Promise<ProviderSourceRun> {
    const source = await this.sourcesService.findOne(sourceId);
    return this.runSourcePipeline(source);
  }

  async runSourcePipeline(source: ProviderSource): Promise<ProviderSourceRun> {
    const runner = this.pipelineRunnerFactory.getRunner(source.provider.key);
    const startedAt = new Date();
    const result = await runner.runSourcePipeline(source);
    return this.runsService.create({
      startedAt,
      completedAt: new Date(),
      source,
      ...result,
    });
  }

  async runProductPipeline(
    providerKey: ProviderKey,
    providerProductId: string,
  ): Promise<any> {
    const runner = this.pipelineRunnerFactory.getRunner(providerKey);
    return await runner.runProductPipeline(providerProductId);
  }
}
