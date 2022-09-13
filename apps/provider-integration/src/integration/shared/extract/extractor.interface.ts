import { Product } from '@app/products/model/product.entity';
import { ProviderKey } from '@app/provider-integration/providers/model/enum/provider-key.enum';
import { ProductSource } from '@app/provider-integration/providers/model/product-source.entity';

export interface Extractor<L, P> {
  providerKey: ProviderKey;

  extractSource(source: ProductSource): L;
  extractDetail(product: Product): P;
}
