import { ProviderProductDataDto } from '@app/provider-integration/etl/dto/provider-product-data.dto';
import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { Channel } from '@app/provider-integration/model/channel.entity';
import { Product } from '@app/provider-integration/model/product.entity';

export interface Mapper<I, P> {
  providerKey: ProviderKey;

  mapChannelItem(item: I): ProviderProductDataDto;
  mapProductDetail(
    existingProduct: Product,
    providerProductDto: P,
  ): ProviderProductDataDto;
}
