import { ProviderSourceRun } from '@app/provider-integration/model/provider-source-run.entity';
import { ProviderSource } from '@app/provider-integration/model/provider-source.entity';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';

export class FindRunsDto extends PartialType(ProviderSourceRun) {
  @IsOptional()
  sourceId?: string;

  @IsOptional()
  source?: ProviderSource;
}
