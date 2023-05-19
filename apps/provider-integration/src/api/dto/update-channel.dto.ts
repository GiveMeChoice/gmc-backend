import { Channel } from '@app/provider-integration/model/channel.entity';
import { PartialType } from '@nestjs/mapped-types';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpdateChannelDto extends PartialType(Channel) {
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
