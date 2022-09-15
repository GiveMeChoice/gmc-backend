import { ProviderKey } from '@app/provider-integration/providers/model/enum/provider-key.enum';
import { ProviderSource } from '@app/provider-integration/providers/model/provider-source.entity';
import { ProductSourcesService } from '@app/provider-integration/providers/services/product-sources.service';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { RUNNER_FACTORY } from '../integration.constants';
import { PipelineResult } from '../model/pipeline-result.entity';
import { PipelineRunnerFactory } from '../shared/runner/pipeline-runner.factory';

@Injectable()
export class IntegrationService {
  constructor(
    private readonly productSourcesService: ProductSourcesService,
    @Inject(RUNNER_FACTORY)
    private readonly pipelineRunnerFactory: PipelineRunnerFactory,
  ) {}

  async integrateSourceById(sourceId: string): Promise<PipelineResult> {
    const source = await this.productSourcesService.findOne(sourceId);
    return this.integrateSource(source);
  }

  async integrateSource(source: ProviderSource): Promise<PipelineResult> {
    Logger.debug(source);
    const runner = this.pipelineRunnerFactory.getRunner(source.provider.key);
    return await runner.runSourcePipeline(source);
  }

  async refreshProduct(provider: ProviderKey, productId: string) {
    // do nothing
  }
}
