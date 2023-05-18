import { ProviderProductDataDto } from '@app/provider-integration/etl/dto/provider-product-data.dto';
import { ProductRefreshReason } from '@app/provider-integration/model/enum/product-refresh-reason.enum';
import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { ProviderSource } from '@app/provider-integration/model/provider-source.entity';
import { Product } from '@app/provider-integration/model/product.entity';
import { ProviderSourceRun } from '@app/provider-integration/model/provider-source-run.entity';

export interface Loader {
  providerKey: ProviderKey;

  loadProductDetail(
    id: string,
    productDetail: ProviderProductDataDto,
    source: ProviderSource,
    runId: string,
    reason: ProductRefreshReason,
  ): Promise<Product>;
  loadSourceItem(
    sourceItem: ProviderProductDataDto,
    run: ProviderSourceRun,
  ): Promise<ProviderSourceRun>;
}
