import { PartialType, PickType } from '@nestjs/mapped-types';
import { Product } from '../../model/product.entity';

// make all properties optional
class PartialProduct extends PartialType(Product) {}

export class ProviderProductDataDto extends PickType(PartialProduct, [
  'merchantProductNumber',
  'sku',
  'title',
  'description',
  'price',
  'shippingPrice',
  'currency',
  'offerUrl',
  'rating',
  'ratingsTotal',
  // relations
  'merchant',
  'merchantBrand',
  'merchantCategory',
  'merchantLabels',
  'reviews',
  'images',
]) {}
