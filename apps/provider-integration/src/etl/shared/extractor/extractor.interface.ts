import { ProviderKey } from '@app/provider-integration/providers/model/enum/provider-key.enum';
import { ProductSource } from '@app/provider-integration/providers/model/product-source.entity';
import { Product } from '@lib/products/model/product.entity';

export interface Extractor<S, P> {
  providerKey: ProviderKey;

  extractSource(source: ProductSource): S;
  extractProduct(product: Product): P;
}
