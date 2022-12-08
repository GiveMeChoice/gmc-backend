import { Brand } from '@app/provider-integration/model/brand.entity';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';

export class UpdateBrandDto extends PartialType(Brand) {
  @IsOptional()
  infoLink?: string;

  @IsOptional()
  logo?: string;

  @IsOptional()
  description?: string;
}
