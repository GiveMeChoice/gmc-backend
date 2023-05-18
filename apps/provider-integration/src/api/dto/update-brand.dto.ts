import { MerchantBrand } from '@app/provider-integration/model/merchant-brand.entity';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';

export class UpdateBrandDto extends PartialType(MerchantBrand) {
  @IsOptional()
  infoLink?: string;

  @IsOptional()
  logo?: string;

  @IsOptional()
  description?: string;
}
