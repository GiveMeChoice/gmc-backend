import { GmcCategory } from '@app/provider-integration/model/gmc-category.entity';
import { GmcLabel } from '@app/provider-integration/model/gmc-label.entity';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, NotContains } from 'class-validator';

export class UpdateGmcLabelDto extends PartialType(GmcLabel) {
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
