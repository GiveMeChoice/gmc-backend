import { MerchantBrand } from '@app/provider-integration/model/merchant-brand.entity';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';

export class FindBrandsDto extends PartialType(MerchantBrand) {
  @IsOptional()
  providerId?: string;
}
