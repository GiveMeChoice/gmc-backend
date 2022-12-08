import { Label } from '@app/provider-integration/model/label.entity';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';

export class UpdateLabelDto extends PartialType(Label) {
  @IsOptional()
  groupId?: string;

  @IsOptional()
  icon?: string;

  @IsOptional()
  description?: string;
}
