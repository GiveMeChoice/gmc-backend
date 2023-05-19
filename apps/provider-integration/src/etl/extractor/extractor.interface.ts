import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { Channel } from '@app/provider-integration/model/channel.entity';
import { Product } from '@app/provider-integration/model/product.entity';
import { ExtractResult } from './extract-result.interface';

export interface Extractor<S, P> {
  providerKey: ProviderKey;

  extractChannel(source: Channel): S;
  extractProduct(
    product: Product,
    skipCache: boolean,
  ): Promise<ExtractResult<P>>;
}
