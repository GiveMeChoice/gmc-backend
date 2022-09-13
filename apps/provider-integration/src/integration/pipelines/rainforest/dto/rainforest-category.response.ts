import { RainforestResponse } from './rainforest.response';

export interface RainforestCategoryResponse extends RainforestResponse {
  category_results: RainforestCategoryResult[];
}

class RainforestCategory {
  name: string;
  id: string;
}

class RainforestCategoryPrice {
  symbol: string;
  value: number;
  currency: string;
  raw: string;
  name: string;
  asin: string;
  link: string;
}

class RainforestCategoryResult {
  position: number;
  title: string;
  asin: string;
  link: string;
  categories: RainforestCategory[];
  image: string;
  is_prime: boolean;
  rating: number;
  ratings_total: number;
  sponsored: boolean;
  prices: RainforestCategoryPrice[];
  price: RainforestCategoryPrice;
  delivery?: {
    tagline: string;
  };
  page: number;
  position_overall: number;
}
