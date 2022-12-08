import { Category } from '@app/provider-integration/model/category.entity';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';

export class UpdateCategoryDto extends PartialType(Category) {
  @IsOptional()
  groupId?: string;

  @IsOptional()
  description?: string;
}
