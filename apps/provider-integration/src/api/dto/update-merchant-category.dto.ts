import { MerchantCategory } from '@app/provider-integration/model/merchant-category.entity';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';

export class UpdateMerchantCategoryDto extends PartialType(MerchantCategory) {
  @IsOptional()
  gmcCategoryId?: string;

  @IsOptional()
  name?: string;
}
