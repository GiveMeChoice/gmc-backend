import { GmcCategory } from '@app/provider-integration/model/gmc-category.entity';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, NotContains } from 'class-validator';

export class UpdateGmcCategoryDto extends PartialType(GmcCategory) {
  @IsOptional()
  @NotContains(' ')
  slug?: string;

  @IsOptional()
  name?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  color?: string;
}
