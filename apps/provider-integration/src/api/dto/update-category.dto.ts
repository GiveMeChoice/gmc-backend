import { ProviderCategory } from '@app/provider-integration/model/provider-category.entity';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';

export class UpdateCategoryDto extends PartialType(ProviderCategory) {
  @IsOptional()
  groupId?: string;

  @IsOptional()
  description?: string;
}
