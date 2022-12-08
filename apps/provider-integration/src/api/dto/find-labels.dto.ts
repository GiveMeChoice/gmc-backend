import { Label } from '@app/provider-integration/model/label.entity';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';

export class FindLabelsDto extends PartialType(Label) {
  @IsOptional()
  providerId?: string;

  @IsOptional()
  groupId?: string;
}
