import { Run } from '@app/provider-integration/model/run.entity';
import { Product } from '@app/provider-integration/model/product.entity';
import { ProviderKey } from '../../model/enum/provider-key.enum';
import { ProductRefreshReason } from '@app/provider-integration/model/enum/product-refresh-reason.enum';
import { Channel } from '@app/provider-integration/model/channel.entity';

export interface Pipeline {
  providerKey: ProviderKey;

  execute(channel: Channel): Promise<Run>;
  refreshProduct(
    product: Product,
    runId: string,
    reason: ProductRefreshReason,
    skipCache?: boolean,
  ): Promise<Product>;
}
