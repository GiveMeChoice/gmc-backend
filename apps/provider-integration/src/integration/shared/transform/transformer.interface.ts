import { Product } from '@app/products/model/product.entity';
import { ProviderKey } from '@app/provider-integration/providers/model/enum/provider-key.enum';

export interface SourceTransformer<I, P> {
  providerKey: ProviderKey;
  fromSourceItem(item: I): Partial<Product>;
  fromProductDetail(product: P): Partial<Product>;
}
