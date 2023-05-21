import { IntersectionType, PartialType, PickType } from '@nestjs/mapped-types';
import { GmcCategory } from '../../model/gmc-category.entity';
import { Product } from '../../model/product.entity';

// make all properties optional
class PartialProduct extends PartialType(Product) {}

export class ProviderProductDataDto extends PickType(PartialProduct, [
  'merchantProductId',
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
  // relations
  'merchant',
  'merchantBrand',
  'merchantCategory',
  'merchantLabels',
  'reviews',
]) {}
