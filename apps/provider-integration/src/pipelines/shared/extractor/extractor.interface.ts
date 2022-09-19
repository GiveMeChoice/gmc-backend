import { ProviderKey } from '@app/provider-integration/providers/model/enum/provider-key.enum';
import { ProviderSource } from '@app/provider-integration/providers/model/provider-source.entity';

export interface Extractor<L, P> {
  providerKey: ProviderKey;

  extractSource(source: ProviderSource): L;
  extractProduct(providerProductId: string): P;
}
