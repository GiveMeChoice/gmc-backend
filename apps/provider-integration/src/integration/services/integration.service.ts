import { ProviderKey } from '@app/provider-integration/providers/model/enum/provider-key.enum';
import { ProductSource } from '@app/provider-integration/providers/model/product-source.entity';
import { ProductSourcesService } from '@app/provider-integration/providers/services/product-sources.service';
import { Injectable } from '@nestjs/common';
import { PipelineResult } from '../model/pipeline-result.entity';
import { PipelineRunnerFactory } from '../shared/runner/pipeline-runner.factory';

@Injectable()
export class IntegrationService {
  constructor(
    private readonly productSourcesService: ProductSourcesService,
    private readonly pipelineRunnerFactory: PipelineRunnerFactory,
  ) {}

  async integrateProductSourceById(sourceId: string): Promise<PipelineResult> {
    const source = await this.productSourcesService.findOne(sourceId);
    return this.integrateProductSource(source);
  }

  async integrateProductSource(source: ProductSource): Promise<PipelineResult> {
    const runner = this.pipelineRunnerFactory.getRunner(source.provider.key);
    return await runner.runSourcePipeline(source);
  }

  async refreshProductDetails(provider: ProviderKey, productId: string) {
    // do nothing
  }
}
