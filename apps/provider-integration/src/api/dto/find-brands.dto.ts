import { Brand } from '@app/provider-integration/model/brand.entity';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';

export class FindBrandsDto extends PartialType(Brand) {
  @IsOptional()
  providerId?: string;
}
