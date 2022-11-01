import { SourceRun } from '@app/provider-integration/model/source-run.entity';
import { Product } from '@lib/products/model/product.entity';
import { ProviderKey } from '../../../model/enum/provider-key.enum';
import { ProductSource } from '../../../model/product-source.entity';

export interface Pipeline {
  providerKey: ProviderKey;

  run(source: ProductSource): Promise<Partial<SourceRun>>;
  refreshProduct(product: Product): Promise<any>;
}
