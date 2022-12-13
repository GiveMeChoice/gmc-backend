import { ProductRefreshReason } from '@app/provider-integration/model/enum/product-refresh-reason.enum';

export class RefreshProductCommandDataDto {
  productId: string;
  runId: string;
  reason: ProductRefreshReason;
  skipCache: boolean;
}
