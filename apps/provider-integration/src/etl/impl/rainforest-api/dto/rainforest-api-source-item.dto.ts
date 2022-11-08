export interface RainforestApiSourceItemDto {
  id: string;
  request: {
    custom_id: string;
    type: string;
    amazon_domain: string;
    search_term: string;
    sort_by: string;
    page: number;
  };
  request_metadata: {
    created_at: Date;
    processed_at: Date;
    total_time_taken: number;
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
      sponsored: boolean;
      price: {
        currency: string;
        value: number;
      };
      page: number;
    };
  };
}
