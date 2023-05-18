import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { ProviderSource } from '@app/provider-integration/model/provider-source.entity';
import { Product } from '@app/provider-integration/model/product.entity';
import { ExtractResult } from './extract-result.interface';

export interface Extractor<S, P> {
  providerKey: ProviderKey;

  extractSource(source: ProviderSource): S;
  extractProduct(
    product: Product,
    skipCache: boolean,
  ): Promise<ExtractResult<P>>;
}
