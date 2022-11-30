import { Product } from '@lib/products/model/product.entity';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';

export class FindProductsDto extends PartialType(Product) {
  @IsOptional()
  providerKey?: string;

  @IsOptional()
  providerProductId?: string;

  @IsOptional()
  sourceId?: string;
}
