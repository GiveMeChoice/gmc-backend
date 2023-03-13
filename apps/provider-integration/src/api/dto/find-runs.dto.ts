import { SourceRun } from '@app/provider-integration/model/source-run.entity';
import { ProductSource } from '@app/provider-integration/model/product-source.entity';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';

export class FindRunsDto extends PartialType(SourceRun) {
  @IsOptional()
  sourceId?: string;

  @IsOptional()
  source?: ProductSource;
}
