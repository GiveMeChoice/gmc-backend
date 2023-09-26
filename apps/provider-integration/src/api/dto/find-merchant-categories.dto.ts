import { MerchantCategory } from '@app/provider-integration/model/merchant-category.entity';
import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';

export class FindMerchantCategoriesDto extends PartialType(MerchantCategory) {
  @IsOptional()
  merchantId?: string;

  @IsOptional()
  merchantCategoryCode?: string;

  @IsOptional()
  gmcCategoryId?: string;

  @IsOptional()
  @IsBoolean()
  unassigned?: boolean;
}
