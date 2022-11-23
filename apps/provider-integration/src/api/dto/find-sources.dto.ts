import { ProductSourceStatus } from '@app/provider-integration/model/enum/product-source-status';
import { ProductSource } from '@app/provider-integration/model/product-source.entity';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';

export class FindSourcesDto extends PartialType(ProductSource) {
  @IsOptional()
  providerId?: string;

  @IsOptional()
  active?: boolean;

  @IsOptional()
  status?: ProductSourceStatus;

  @IsOptional()
  identifier?: string;
}
