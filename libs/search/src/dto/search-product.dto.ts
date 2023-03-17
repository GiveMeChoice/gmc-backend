import { SearchCategoryDto } from './search-category.dto';
import { SearchImageDto } from './search-image.dto';
import { SearchLabelDto } from './search-label.dto';

export interface SearchProductDto {
  id?: string;
  sku?: string;
  provider?: {
    key?: string;
    productId?: string;
    region?: string;
    description?: string;
  };
  title?: string;
  description?: string;
  price?: number;
  offerLink?: string;
  images?: {
    list?: SearchImageDto;
    detail?: SearchImageDto;
    other?: SearchImageDto[];
  };
  brand?: string;
  category?: {
    providerCategory?: string;
    gmcCategory?: SearchCategoryDto;
  };
  label?: {
    providerLabel?: string;
    gmcLabel?: SearchLabelDto;
  }[];
}
