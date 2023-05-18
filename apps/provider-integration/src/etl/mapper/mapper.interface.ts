import { ProviderProductDataDto } from '@app/provider-integration/etl/dto/provider-product-data.dto';
import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { ProviderSource } from '@app/provider-integration/model/provider-source.entity';

export interface Mapper<I, P> {
  providerKey: ProviderKey;

  mapSourceItem(item: I): ProviderProductDataDto;
  mapProductDetail(
    productDto: P,
    source: ProviderSource,
  ): ProviderProductDataDto;
}
