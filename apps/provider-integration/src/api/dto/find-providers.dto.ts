import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { Provider } from '@app/provider-integration/model/provider.entity';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';

export class FindProvidersDto extends PartialType(Provider) {
  @IsOptional()
  id?: string;

  @IsOptional()
  key?: ProviderKey;

  @IsOptional()
  active?: boolean;
}
