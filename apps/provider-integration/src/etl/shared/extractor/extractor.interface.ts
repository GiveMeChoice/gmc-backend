import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { ProductSource } from '@app/provider-integration/model/product-source.entity';
import { Product } from '@app/provider-integration/model/product.entity';
import { ExtractResult } from './extract-result.interface';

export interface Extractor<S, P> {
  providerKey: ProviderKey;

  extractSource(source: ProductSource): S;
  extractProduct(product: Product, skipCache: boolean): P;
}
