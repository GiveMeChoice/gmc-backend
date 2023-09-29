import { GmcBrand } from '@app/provider-integration/model/gmc-brand.entity';
import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional, IsString, NotContains } from 'class-validator';

export class CreateGmcBrandDto extends PartialType(GmcBrand) {
  @IsNotEmpty()
  @IsString()
  @NotContains(' ')
  slug?: string;

  @IsNotEmpty()
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