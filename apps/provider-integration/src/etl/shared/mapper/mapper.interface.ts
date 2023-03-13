import { ProductDataDto } from '@app/provider-integration/model/dto/product-data.dto';
import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { ProductSource } from '@app/provider-integration/model/product-source.entity';

export interface Mapper<I, P> {
  providerKey: ProviderKey;

  mapSourceItem(item: I): ProductDataDto;
  mapProductDetail(productDto: P, source: ProductSource): ProductDataDto;
}
