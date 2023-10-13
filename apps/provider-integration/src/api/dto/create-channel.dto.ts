import { Channel } from '@app/provider-integration/model/channel.entity';
import { MerchantKey } from '@app/provider-integration/model/enum/merchant-key.enum';
import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateChannelDto extends PartialType(Channel) {
  @IsString()
  name: string;

  // @IsOptional()
  // active?: boolean;

  @IsEnum(ProviderKey)
  providerKey: string;

  @IsEnum(MerchantKey)
  merchantKey: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  runIntervalHours?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  expirationHours?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  retryLimit?: number;

  @IsOptional()
  etlCode1?: string;

  @IsOptional()
  etlCode2?: string;

  @IsOptional()
  etlCode3?: string;

  @IsOptional()
  etlCode4?: string;

  @IsOptional()
  etlCode5?: string;
}
