import { ProviderKey } from '@app/provider-integration/providers/model/provider-key.enum';
import { Provider } from '@app/provider-integration/providers/model/provider.entity';

export const ProviderSeed: Provider[] = [
  {
    id: ProviderKey.RAINFOREST_API,
    description: 'An awesome API for a really big internet store',
  },
  {
    id: ProviderKey.ETHICAL_SUPERSTORE,
    description: 'www.EthicalSuperstore.com',
  },
];
