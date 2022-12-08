import { Category } from '@app/provider-integration/model/category.entity';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';

export class FindCategoriesDto extends PartialType(Category) {
  @IsOptional()
  providerId?: string;

  @IsOptional()
  groupId?: string;
}
