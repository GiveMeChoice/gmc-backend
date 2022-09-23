import { Product } from '@lib/products/model/product.entity';
import { ProviderKey } from '@app/provider-integration/providers/model/enum/provider-key.enum';

export interface SourceTransformer<I, P> {
  providerKey: ProviderKey;

  mapSourceItem(item: I): Partial<Product>;
  mapProductDetails(productDto: P): Partial<Product>;
}
