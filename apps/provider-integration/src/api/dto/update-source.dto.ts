import { ProductSource } from '@app/provider-integration/model/product-source.entity';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';

export class UpdateSourceDto extends PartialType(ProductSource) {
  @IsOptional()
  active?: boolean;
}
