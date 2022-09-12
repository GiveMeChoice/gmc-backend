import { ProviderKey } from '@app/provider-integration/providers/model/enum/provider-key.enum';
import { Inject, Logger } from '@nestjs/common';
import { PipelineResult } from '../../model/pipeline-result.entity';
import { Pipeline } from '../../model/pipeline.entity';
import { PipelineResultsService } from '../../services/pipeline-results.service';
import { PipelineService } from '../../services/pipeline.service';
import { PipelineRunner } from './pipeline-runner.interface';

export abstract class PipelineRunnerBase implements PipelineRunner {
  providerKey: ProviderKey;

  @Inject(PipelineService)
  private readonly pipelineService: PipelineService;

  @Inject(PipelineResultsService)
  private readonly resultsService: PipelineResultsService;

  async runById(id: string): Promise<PipelineResult> {
    const pipeline = await this.pipelineService.findOne(id);
    return this.run(pipeline);
  }

  async run(pipeline: Pipeline): Promise<PipelineResult> {
    Logger.debug(
      `Running pipeline "${pipeline.description}" for provider: ${pipeline.provider.key}`,
    );
    const result = await this.runInternal(pipeline);
    return this.resultsService.create(result);
  }

  abstract runInternal(pipeline: Pipeline): Promise<Partial<PipelineResult>>;
}
