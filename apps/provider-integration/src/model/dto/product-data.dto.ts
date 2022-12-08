import { IntersectionType, PartialType, PickType } from '@nestjs/mapped-types';
import { Product } from '../product.entity';

class PartialProduct extends PartialType(Product) {}

export class ProductDataDto extends PickType(PartialProduct, [
  'sku',
  'title',
  'description',
  'rating',
  'ratingsTotal',
  'price',
  'currency',
  'brandId',
  'brandName',
  'mainImage',
  'offerLink',
  'labels',
]) {}

export class ProductRefreshDto extends IntersectionType(
  class ProductRefreshMetadata extends PickType(PartialProduct, [
    'sourceDate',
  ]) {},
  ProductDataDto,
) {}

export class SourceItemDataDto extends PickType(PartialProduct, [
  'providerProductId',
  'price',
  'listImage',
  'offerLink',
]) {}
