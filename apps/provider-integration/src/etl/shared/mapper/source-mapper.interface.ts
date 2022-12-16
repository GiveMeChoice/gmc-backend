import {
  ProductDataDto,
  SourceItemDataDto,
} from '@app/provider-integration/model/dto/product-data.dto';
import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { ProductSource } from '@app/provider-integration/model/product-source.entity';

export interface SourceMapper<I, P> {
  providerKey: ProviderKey;

  mapSourceItem(item: I): SourceItemDataDto;
  mapProductData(productDto: P, source: ProductSource): ProductDataDto;
}
