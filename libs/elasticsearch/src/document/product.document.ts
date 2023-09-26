import { BrandDocument } from './brand.document';
import { CategoryDocument } from './category.document';
import { ImageDocument } from './image.document';
import { LabelDocument } from './label.document';
import { MerchantDocument } from './merchant.document';
import { ReviewDocument } from './review.document';

export interface ProductDocument {
  id?: string;
  merchantProductCode?: string;
  sku?: string;
  title?: string;
  description?: string;
  price?: number;
  currency?: string;
  rating?: number;
  ratingsTotal?: number;
  shippingPrice?: number;
  offerUrl?: string;
  // // RELATIONS // //
  merchant?: MerchantDocument;
  brand?: BrandDocument;
  category?: CategoryDocument;
  reviews?: ReviewDocument[];
  images?: ImageDocument[];
  labels?: LabelDocument[];
}
