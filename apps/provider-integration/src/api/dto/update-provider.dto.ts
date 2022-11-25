import { Provider } from '@app/provider-integration/model/provider.entity';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';

export class UpdateProviderDto extends PartialType(Provider) {
  @IsOptional()
  active?: boolean;
}
