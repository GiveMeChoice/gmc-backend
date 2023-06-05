import { Channel } from '@app/provider-integration/model/channel.entity';
import { ProductStatus } from '@app/provider-integration/model/enum/product-status.enum';
import { MerchantCategory } from '@app/provider-integration/model/merchant-category.entity';
import { MerchantLabel } from '@app/provider-integration/model/merchant-label.entity';
import { Merchant } from '@app/provider-integration/model/merchant.entity';
import { Product } from '@app/provider-integration/model/product.entity';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';

export class FindProductsDto extends PartialType(Product) {
  @IsOptional()
  merchantProductCode?: string;

  @IsOptional()
  status?: ProductStatus;

  @IsOptional()
  channel?: Channel;

  @IsOptional()
  merchant?: Merchant;

  @IsOptional()
  shortId?: string;

  @IsOptional()
  errorMessage?: string;

  @IsOptional()
  merchantLabel?: MerchantLabel;

  @IsOptional()
  merchantCategory?: MerchantCategory;
}
