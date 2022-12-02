import { ProductRun } from '@app/provider-integration/model/product-run.entity';
import { Product } from '@app/provider-integration/model/product.entity';
import { ProviderKey } from '../../../model/enum/provider-key.enum';

export interface Pipeline {
  providerKey: ProviderKey;

  execute(run: ProductRun): Promise<ProductRun>;
  refreshProduct(
    product: Product,
    skipCache: boolean,
  ): Promise<Partial<Product>>;
}
