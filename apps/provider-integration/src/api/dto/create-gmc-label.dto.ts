import { GmcLabel } from '@app/provider-integration/model/gmc-label.entity';
import { PartialType } from '@nestjs/mapped-types';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  NotContains,
  NotEquals,
} from 'class-validator';

export class CreateGmcLabelDto extends PartialType(GmcLabel) {
  @IsOptional()
  parentId: string;

  @IsString()
  @IsNotEmpty()
  @NotContains(' ')
  @NotEquals('root')
  slug?: string;

  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
