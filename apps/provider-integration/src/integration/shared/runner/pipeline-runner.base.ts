import { ProviderKey } from '@app/provider-integration/providers/model/enum/provider-key.enum';
import { ProviderSource } from '@app/provider-integration/providers/model/provider-source.entity';
import { Inject, Logger } from '@nestjs/common';
import { PipelineResult } from '../../model/pipeline-result.entity';
import { PipelineResultsService } from '../../services/pipeline-results.service';
import { PipelineRunner } from './pipeline-runner.interface';

export abstract class PipelineRunnerBase implements PipelineRunner {
  providerKey: ProviderKey;

  @Inject(PipelineResultsService)
  private readonly resultsService: PipelineResultsService;

  async runSourcePipeline(source: ProviderSource): Promise<PipelineResult> {
    Logger.debug(
      `Running source pipeline "${source.description}" for provider: ${source.provider.key}`,
    );
    const startedAt = new Date();
    const result = await this.runListPipelineInternal(source);
    return this.resultsService.create({
      startedAt,
      completedAt: new Date(),
      ...result,
    });
  }

  async runProductPipeline(product: any): Promise<PipelineResult> {
    throw new Error('Method not implemented.');
  }

  abstract runListPipelineInternal(
    list: ProviderSource,
  ): Promise<Partial<PipelineResult>>;
}
