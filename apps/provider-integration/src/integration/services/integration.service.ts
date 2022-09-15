import { ProviderKey } from '@app/provider-integration/providers/model/enum/provider-key.enum';
import { ProviderSource } from '@app/provider-integration/providers/model/provider-source.entity';
import { ProductSourcesService } from '@app/provider-integration/providers/services/product-sources.service';
import { Inject, Injectable } from '@nestjs/common';
import { RUNNER_FACTORY } from '../constants/integration.tokens';
import { PipelineResult } from '../model/pipeline-result.entity';
import { PipelineRunnerFactory } from '../shared/runner/pipeline-runner.factory';

@Injectable()
export class IntegrationService {
  constructor(
    private readonly productSourcesService: ProductSourcesService,
    @Inject(RUNNER_FACTORY)
    private readonly pipelineRunnerFactory: PipelineRunnerFactory,
  ) {}

  async integrateProductSourceById(sourceId: string): Promise<PipelineResult> {
    const source = await this.productSourcesService.findOne(sourceId);
    return this.integrateProductSource(source);
  }

  async integrateProductSource(
    source: ProviderSource,
  ): Promise<PipelineResult> {
    const runner = this.pipelineRunnerFactory.getRunner(source.provider.key);
    return await runner.runSourcePipeline(source);
  }

  async refreshProductDetails(provider: ProviderKey, productId: string) {
    // do nothing
  }
}
