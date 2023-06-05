import { Merchant } from '@app/provider-integration/model/merchant.entity';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';

export class UpdateMerchantDto extends PartialType(Merchant) {
  @IsOptional()
  name?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  logo?: string;

  @IsOptional()
  url?: string;
}
