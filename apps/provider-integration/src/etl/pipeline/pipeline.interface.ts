import { Run } from '@app/provider-integration/model/run.entity';
import { Product } from '@app/provider-integration/model/product.entity';
import { ProviderKey } from '../../model/enum/provider-key.enum';
import { ProductRefreshReason } from '@app/provider-integration/model/enum/product-refresh-reason.enum';

export interface Pipeline {
  providerKey: ProviderKey;

  executeChannel(run: Run): Promise<Run>;
  executeProduct(
    product: Product,
    runId: string,
    reason: ProductRefreshReason,
    skipCache?: boolean,
  ): Promise<Product>;
}
