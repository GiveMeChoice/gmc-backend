export interface RainforestCategoryItem {
  id: string;
  request: {
    custom_id: string;
    type: string;
    amazon_domain: string;
    search_term: string;
    sort_by: string;
    page: number;
  };
  success: boolean;
  result: {
    category_results: {
      position: number;
      title: string;
      asin: string;
      link: string;
      image: string;
      rating: number;
      ratings_total: number;
      is_prime: boolean;
      sponspored: boolean;
      price: {
        currency: string;
        value: number;
      };
      page: number;
    };
  };
}
