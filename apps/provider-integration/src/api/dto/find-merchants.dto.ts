import { MerchantKey } from '@app/provider-integration/model/enum/merchant-key.enum';
import { Merchant } from '@app/provider-integration/model/merchant.entity';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';

export class FindMerchantsDto extends PartialType(Merchant) {
  @IsOptional()
  id?: string;

  @IsOptional()
  key?: MerchantKey;
}
