import { ProviderSource } from '@app/provider-integration/model/provider-source.entity';
import { PartialType } from '@nestjs/mapped-types';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpdateSourceDto extends PartialType(ProviderSource) {
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
