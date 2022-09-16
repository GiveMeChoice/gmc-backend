import { ProviderKey } from '@app/provider-integration/providers/model/enum/provider-key.enum';
import { ProviderSourceRun } from '@app/provider-integration/providers/model/provider-source-run.entity';
import { ProviderSource } from '@app/provider-integration/providers/model/provider-source.entity';
import { ProviderSourceRunsService } from '@app/provider-integration/providers/services/provider-source-runs.service';
import { Inject, Logger } from '@nestjs/common';
import { PipelineRunner } from './pipeline-runner.interface';

export abstract class PipelineRunnerBase implements PipelineRunner {
  providerKey: ProviderKey;

  @Inject(ProviderSourceRunsService)
  private readonly runsService: ProviderSourceRunsService;

  async runSourcePipeline(source: ProviderSource): Promise<ProviderSourceRun> {
    Logger.debug(
      `Running source pipeline "${source.description}" for provider: ${source.provider.key}`,
    );
    const startedAt = new Date();
    const result = await this.runSourcePipelineInternal(source);
    return this.runsService.create({
      startedAt,
      completedAt: new Date(),
      source,
      ...result,
    });
  }

  async runProductPipeline(product: any): Promise<boolean> {
    return true;
  }

  abstract runSourcePipelineInternal(
    source: ProviderSource,
  ): Promise<Partial<ProviderSourceRun>>;
}
