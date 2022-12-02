import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { Product } from '@app/provider-integration/model/product.entity';

export interface SourceTransformer<I, P> {
  providerKey: ProviderKey;

  mapSourceItem(item: I): Partial<Product>;
  mapProductDetails(productDto: P): Partial<Product>;
}
