import { ProviderKey } from '../../../providers/model/enum/provider-key.enum';
import { ProviderSource } from '../../../providers/model/provider-source.entity';
import { PipelineResult } from '../../model/pipeline-result.entity';

export interface PipelineRunner {
  providerKey: ProviderKey;
  runSourcePipeline(source: ProviderSource): Promise<PipelineResult>;
  runProductPipeline(product): Promise<PipelineResult>;
}
