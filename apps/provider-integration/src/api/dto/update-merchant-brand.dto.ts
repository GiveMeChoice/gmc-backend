import { MerchantBrand } from '@app/provider-integration/model/merchant-brand.entity';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';

export class UpdateMerchantBrandDto extends PartialType(MerchantBrand) {
  @IsOptional()
  url?: string;

  @IsOptional()
  logo?: string;

  @IsOptional()
  description?: string;
}