import { ProviderProductDataDto } from '@app/provider-integration/etl/dto/provider-product-data.dto';
import { ProductRefreshReason } from '@app/provider-integration/model/enum/product-refresh-reason.enum';
import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { Channel } from '@app/provider-integration/model/channel.entity';
import { Product } from '@app/provider-integration/model/product.entity';
import { Run } from '@app/provider-integration/model/run.entity';

export interface Loader {
  providerKey: ProviderKey;

  loadChannelItem(channelItem: ProviderProductDataDto, run: Run): Promise<Run>;
  refreshProduct(
    id: string,
    productDetail: ProviderProductDataDto,
    source: Channel,
    runId: string,
    reason: ProductRefreshReason,
  ): Promise<Product>;
}
