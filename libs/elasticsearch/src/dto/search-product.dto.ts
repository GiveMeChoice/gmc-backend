import { SearchBrandDto } from './search-brand.dto';
import { SearchCategoryDto } from './search-category.dto';
import { SearchImageDto } from './search-image.dto';
import { SearchLabelDto } from './search-label.dto';
import { SearchMerchantDto } from './search-merchant.dto';

export interface SearchProductDto {
  id?: string;
  region?: string;
  merchantProductCode?: string;
  sku?: string;
  title?: string;
  description?: string;
  price?: number;
  offerLink?: string;
  merchant?: SearchMerchantDto;
  images?: {
    list?: SearchImageDto;
    detail?: SearchImageDto;
    other?: SearchImageDto[];
  };
  brand?: SearchBrandDto;
  category?: {
    merchantCategory?: string;
    gmcCategory?: SearchCategoryDto;
  };
  labels?: SearchLabelDto[];
}
