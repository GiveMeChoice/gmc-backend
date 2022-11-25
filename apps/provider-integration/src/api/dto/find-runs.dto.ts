import { SourceRun } from '@app/provider-integration/model/source-run.entity';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';

export class FindRunsDto extends PartialType(SourceRun) {
  @IsOptional()
  sourceId?: string;
}
