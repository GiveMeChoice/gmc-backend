import { ProviderKey } from '../../../providers/model/enum/provider-key.enum';
import { ProductSource } from '../../../providers/model/product-source.entity';
import { PipelineResult } from '../../model/pipeline-result.entity';

export interface PipelineRunner {
  providerKey: ProviderKey;
  runSourcePipeline(source: ProductSource): Promise<PipelineResult>;
  runProductPipeline(product): Promise<PipelineResult>;
}
