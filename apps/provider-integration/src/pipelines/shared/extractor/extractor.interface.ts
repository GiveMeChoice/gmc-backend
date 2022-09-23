import { ProviderKey } from '@app/provider-integration/providers/model/enum/provider-key.enum';
import { ProviderSource } from '@app/provider-integration/providers/model/provider-source.entity';
import { Product } from '@lib/products/model/product.entity';

export interface Extractor<S, P> {
  providerKey: ProviderKey;

  extractSource(source: ProviderSource): S;
  extractProduct(product: Product): P;
}
