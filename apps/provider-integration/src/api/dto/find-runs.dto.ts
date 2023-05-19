import { Run } from '@app/provider-integration/model/run.entity';
import { Channel } from '@app/provider-integration/model/channel.entity';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';

export class FindRunsDto extends PartialType(Run) {
  @IsOptional()
  channelId?: string;

  @IsOptional()
  channel?: Channel;
}
