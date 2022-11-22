import { SourceRun } from '@app/provider-integration/model/source-run.entity';
import { PageRequest } from '@lib/database/interface/page-request.interface';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';

export class FindRunsDto extends PartialType(SourceRun) implements PageRequest {
  @IsOptional()
  sourceId?: string;

  @IsOptional()
  skip: number;

  @IsOptional()
  take: number;
}
