import { GmcLabel } from '@app/provider-integration/model/gmc-label.entity';
import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional, IsString, NotContains } from 'class-validator';

export class CreateGmcLabelDto extends PartialType(GmcLabel) {
  @IsNotEmpty()
  parentId: string;

  @IsString()
  @IsNotEmpty()
  @NotContains(' ')
  slug?: string;

  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
