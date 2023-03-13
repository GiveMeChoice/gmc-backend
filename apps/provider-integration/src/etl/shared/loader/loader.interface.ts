import { ProductDataDto } from '@app/provider-integration/model/dto/product-data.dto';
import { ProductRefreshReason } from '@app/provider-integration/model/enum/product-refresh-reason.enum';
import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { ProductSource } from '@app/provider-integration/model/product-source.entity';
import { Product } from '@app/provider-integration/model/product.entity';
import { SourceRun } from '@app/provider-integration/model/source-run.entity';

export interface Loader {
  providerKey: ProviderKey;

  loadProductDetail(
    id: string,
    productDetail: ProductDataDto,
    source: ProductSource,
    runId: string,
    reason: ProductRefreshReason,
  ): Promise<Product>;
  loadSourceItem(
    sourceItem: ProductDataDto,
    run: SourceRun,
  ): Promise<SourceRun>;
}
