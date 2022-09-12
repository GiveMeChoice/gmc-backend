import { Product } from '@app/products/model/product.entity';
import { ProviderKey } from '../../../providers/model/enum/provider-key.enum';
import { PipelineResult } from '../../model/pipeline-result.entity';
import { Pipeline } from '../../model/pipeline.entity';

export interface PipelineRunner {
  providerKey: ProviderKey;
  runById(pipelineId: string): Promise<PipelineResult>;
  run(pipeline: Pipeline): Promise<PipelineResult>;
}
