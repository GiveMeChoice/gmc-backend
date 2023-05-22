import { ChannelStatus } from '@app/provider-integration/model/enum/channel-status';
import { Channel } from '@app/provider-integration/model/channel.entity';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';
import { Merchant } from '@app/provider-integration/model/merchant.entity';
import { Provider } from '@app/provider-integration/model/provider.entity';

export class FindChannelsDto extends PartialType(Channel) {
  @IsOptional()
  id?: string;

  @IsOptional()
  active?: boolean;

  @IsOptional()
  status?: ChannelStatus;

  @IsOptional()
  merchant?: Merchant;

  @IsOptional()
  provider?: Provider;
}
