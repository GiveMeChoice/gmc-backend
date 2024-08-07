import { MerchantLabel } from '@app/provider-integration/model/merchant-label.entity';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';

export class UpdateMerchantLabelDto extends PartialType(MerchantLabel) {
  @IsOptional()
  gmcLabelId?: string;

  @IsOptional()
  logo?: string;

  @IsOptional()
  url?: string;

  @IsOptional()
  name?: string;

  @IsOptional()
  description?: string;
}
