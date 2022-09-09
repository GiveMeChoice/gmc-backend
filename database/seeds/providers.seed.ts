import { ProviderKey } from '@app/provider-integration/providers/model/enum/provider-key.enum';
import { Provider } from '@app/provider-integration/providers/model/provider.entity';

export const ProviderSeed: Provider[] | any = [
  {
    key: ProviderKey.RAINFOREST_API,
    description: 'An awesome API for a really big internet store',
  },
  {
    key: ProviderKey.ETHICAL_SUPERSTORE,
    description: 'www.EthicalSuperstore.com',
  },
];
