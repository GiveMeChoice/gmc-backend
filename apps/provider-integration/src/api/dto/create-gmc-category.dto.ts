import { GmcCategory } from '@app/provider-integration/model/gmc-category.entity';
import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional, IsString, NotContains } from 'class-validator';

export class CreateGmcCategoryDto extends PartialType(GmcCategory) {
  @IsNotEmpty()
  parentId: string;

  @IsNotEmpty()
  @IsString()
  @NotContains(' ')
  slug?: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  name?: string;
}
