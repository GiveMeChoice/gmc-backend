import { Merchant } from '@app/provider-integration/model/merchant.entity';
import { Provider } from '@app/provider-integration/model/provider.entity';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';

export class UpdateMerchantDto extends PartialType(Merchant) {
  @IsOptional()
  name?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  logoUrl?: string;
}
