import { MerchantCategory } from '@app/provider-integration/model/merchant-category.entity';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';

export class FindProviderCategoriesDto extends PartialType(MerchantCategory) {
  @IsOptional()
  merchantId?: string;

  @IsOptional()
  code?: string;

  @IsOptional()
  categoryId?: string;
}
