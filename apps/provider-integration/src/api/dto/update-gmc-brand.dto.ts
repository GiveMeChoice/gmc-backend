import { GmcBrand } from '@app/provider-integration/model/gmc-brand.entity';
import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional, IsString, NotContains } from 'class-validator';

export class UpdateGmcBrandDto extends PartialType(GmcBrand) {
  @IsString()
  @NotContains(' ')
  @IsOptional()
  slug?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  url?: string;
}
