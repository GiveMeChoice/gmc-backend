import {
  ProductDataDto,
  SourceItemDataDto,
} from '@app/provider-integration/model/dto/product-data.dto';
import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';

export interface SourceTransformer<I, P> {
  providerKey: ProviderKey;

  mapSourceItem(item: I): SourceItemDataDto;
  mapProductData(productDto: P): ProductDataDto;
}
