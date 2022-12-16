import { IntersectionType, PartialType, PickType } from '@nestjs/mapped-types';
import { Product } from '../product.entity';

class PartialProduct extends PartialType(Product) {}

export class ProductDataDto extends PickType(PartialProduct, [
  'sku',
  'title',
  'description',
  'price',
  'shippingPrice',
  'currency',
  'listImage',
  'mainImage',
  'secondaryImage',
  'offerLink',
  'rating',
  'ratingsTotal',
  'brand',
  'category',
  'categoryDetail',
  'reviews',
  'labels',
  'provider',
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
