import { MerchantLabel } from '@app/provider-integration/model/merchant-label.entity';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';

export class FindMerchantLabelsDto extends PartialType(MerchantLabel) {
  @IsOptional()
  merchantId?: string;

  @IsOptional()
  gmcLabelId?: string;
}
