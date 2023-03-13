import { ProductRefreshReason } from '@app/provider-integration/model/enum/product-refresh-reason.enum';

export class IntegrateProductCommandDataDto {
  productId: string;
  runId: string;
  reason: ProductRefreshReason;
  skipCache?: boolean;
}
