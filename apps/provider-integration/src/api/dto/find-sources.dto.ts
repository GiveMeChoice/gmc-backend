import { ProviderSourceStatus } from '@app/provider-integration/model/enum/provider-source-status';
import { ProviderSource } from '@app/provider-integration/model/provider-source.entity';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';

export class FindSourcesDto extends PartialType(ProviderSource) {
  @IsOptional()
  id?: string;

  @IsOptional()
  providerId?: string;

  @IsOptional()
  active?: boolean;

  @IsOptional()
  status?: ProviderSourceStatus;

  @IsOptional()
  identifier?: string;
}
