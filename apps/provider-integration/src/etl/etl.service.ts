import { ProductSource } from '@app/provider-integration/model/product-source.entity';
import { Product } from '@lib/products/model/product.entity';
import { Inject, Injectable } from '@nestjs/common';
import { SourceRun } from '../model/source-run.entity';
import { SourceRunsService } from '../services/source-runs.service';
import { PIPELINE_FACTORY } from './etl.constants';
import { PipelineFactory } from './shared/pipeline/pipeline.factory';

@Injectable()
export class EtlService {
  constructor(
    private readonly runsService: SourceRunsService,
    @Inject(PIPELINE_FACTORY)
    private readonly pipelineFactory: PipelineFactory,
  ) {}

  async runSourcePipeline(source: ProductSource): Promise<SourceRun> {
    const pipeline = this.pipelineFactory.getPipeline(source.provider.id);
    const startedAt = new Date();
    const result = await pipeline.run(source);
    return this.runsService.create({
      startedAt,
      completedAt: new Date(),
      source,
      ...result,
    });
  }

  async refreshProduct(product: Product, run: SourceRun): Promise<any> {
    const runner = this.pipelineFactory.getPipeline(product.providerId);
    return await runner.refreshProduct(product);
  }
}
