import { Product } from '@lib/products/model/product.entity';
import { ProviderKey } from '@app/provider-integration/providers/model/enum/provider-key.enum';
import { ProviderSource } from '@app/provider-integration/providers/model/provider-source.entity';

export interface Extractor<L, P> {
  providerKey: ProviderKey;

  extractSource(source: ProviderSource): L;
  extractDetail(product: Product): P;
}
