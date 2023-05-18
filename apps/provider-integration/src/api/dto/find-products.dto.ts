import { MerchantCategory } from '@app/provider-integration/model/merchant-category.entity';
import { ProductStatus } from '@app/provider-integration/model/enum/product-status.enum';
import { MerchantLabel } from '@app/provider-integration/model/merchant-label.entity';
import { ProviderSource } from '@app/provider-integration/model/provider-source.entity';
import { Product } from '@app/provider-integration/model/product.entity';
import { Provider } from '@app/provider-integration/model/provider.entity';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';
import { Merchant } from '@app/provider-integration/model/merchant.entity';

export class FindProductsDto extends PartialType(Product) {
  @IsOptional()
  merchantProductId?: string;

  @IsOptional()
  integrationStatus?: ProductStatus;

  @IsOptional()
  source?: ProviderSource;

  @IsOptional()
  merchant?: Merchant;

  @IsOptional()
  shortId?: string;

  @IsOptional()
  hasIntegrationError?: boolean;

  @IsOptional()
  label?: MerchantLabel;

  @IsOptional()
  merchantCategory?: MerchantCategory;
}
