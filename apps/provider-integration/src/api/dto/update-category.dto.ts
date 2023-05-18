import { MerchantCategory } from '@app/provider-integration/model/merchant-category.entity';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';

export class UpdateCategoryDto extends PartialType(MerchantCategory) {
  @IsOptional()
  groupId?: string;

  @IsOptional()
  description?: string;
}
