import { IntersectionType, PartialType, PickType } from '@nestjs/mapped-types';
import { Product } from '../product.entity';

class PartialProduct extends PartialType(Product) {}

export class ProductDataDto extends PickType(PartialProduct, [
  'providerProductId',
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
  // relations
  'providerCategory',
  'reviews',
  'labels',
  'provider',
]) {}

// export class ProductUpdateDto extends PickType(PartialProduct, [
//   'providerProductId',
//   'sku',
//   'title',
//   'description',
//   'price',
//   'shippingPrice',
//   'currency',
//   'listImage',
//   'mainImage',
//   'secondaryImage',
//   'offerLink',
//   'rating',
//   'ratingsTotal',
//   'brand',
//   'category',
//   'categoryDetail',
//   // relations
//   'reviews',
//   'labels',
//   'provider',
//   'source',
// ]) {}

// export class ProductRefreshDto extends IntersectionType(
//   class ProductRefreshMetadata extends PickType(PartialProduct, [
//     'sourceDate',
//   ]) {},
//   ProductDataDto,
// ) {}

// export class SourceItemDataDto extends PickType(Product, [
//   'providerProductId',
//   'price',
//   'listImage',
//   'offerLink',
// ]) {}
