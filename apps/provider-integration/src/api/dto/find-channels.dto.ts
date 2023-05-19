import { ChannelStatus } from '@app/provider-integration/model/enum/channel-status';
import { Channel } from '@app/provider-integration/model/channel.entity';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';

export class FindChannelsDto extends PartialType(Channel) {
  @IsOptional()
  id?: string;

  @IsOptional()
  providerId?: string;

  @IsOptional()
  active?: boolean;

  @IsOptional()
  status?: ChannelStatus;
}
