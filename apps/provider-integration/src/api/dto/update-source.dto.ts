import { ProductSource } from '@app/provider-integration/model/product-source.entity';
import { PartialType } from '@nestjs/mapped-types';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpdateSourceDto extends PartialType(ProductSource) {
  @IsOptional()
  active?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  runIntervalHours?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  retryLimit?: number;
}
