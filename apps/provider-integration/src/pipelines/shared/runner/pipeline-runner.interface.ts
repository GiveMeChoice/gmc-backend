import { ProviderSourceRun } from '@app/provider-integration/providers/model/provider-source-run.entity';
import { ProviderKey } from '../../../providers/model/enum/provider-key.enum';
import { ProviderSource } from '../../../providers/model/provider-source.entity';

export interface PipelineRunner {
  providerKey: ProviderKey;
  runSourcePipeline(source: ProviderSource): Promise<ProviderSourceRun>;
  runProductPipeline(product): Promise<boolean>;
}
