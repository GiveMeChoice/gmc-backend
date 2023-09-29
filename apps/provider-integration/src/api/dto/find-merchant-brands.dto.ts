import { MerchantBrand } from '@app/provider-integration/model/merchant-brand.entity';
import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';

export class FindMerchantBrandsDto extends PartialType(MerchantBrand) {
  @IsOptional()
  merchantId?: string;

  @IsOptional()
  merchantBrandCode?: string;

  @IsOptional()
  gmcBrandId?: string;

  @IsOptional()
  @IsBoolean()
  unassigned?: boolean;
}
