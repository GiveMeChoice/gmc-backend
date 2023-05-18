import { ProviderSourceRun } from '@app/provider-integration/model/provider-source-run.entity';
import { Product } from '@app/provider-integration/model/product.entity';
import { ProviderKey } from '../../../model/enum/provider-key.enum';
import { ProductRefreshReason } from '@app/provider-integration/model/enum/product-refresh-reason.enum';

export interface Pipeline {
  providerKey: ProviderKey;

  executeSource(run: ProviderSourceRun): Promise<ProviderSourceRun>;
  executeProduct(
    product: Product,
    runId: string,
    reason: ProductRefreshReason,
    skipCache?: boolean,
  ): Promise<Product>;
}
