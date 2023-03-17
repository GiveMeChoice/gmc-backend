import { IntersectionType, PartialType, PickType } from '@nestjs/mapped-types';
import { Category } from '../category.entity';
import { Product } from '../product.entity';

// make all properties optional
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

class SearchNativeFields {
  category: Category;
}

export class ProductSearchDto extends IntersectionType(
  class SearchProductFields extends PickType(PartialProduct, [
    'shortId',
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
    'reviews',
    'labels',
    'provider',
    'source',
  ]) {},
  SearchNativeFields,
) {}
