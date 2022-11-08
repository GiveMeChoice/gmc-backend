import { ProductSource } from '@app/provider-integration/model/product-source.entity';
import { SourceRun } from '@app/provider-integration/model/source-run.entity';
import { Product } from '@lib/products/model/product.entity';
import { ProviderKey } from '../../../model/enum/provider-key.enum';

export interface Pipeline {
  providerKey: ProviderKey;

  execute(run: SourceRun): Promise<SourceRun>;
  refreshProduct(
    product: Product,
    source: ProductSource,
    runId: string,
    skipCache: boolean,
  ): Promise<Partial<Product>>;
}
