export interface RainforestResponse {
  request_info: {
    success: boolean;
    credits_used: number;
    credits_used_this_request: number;
    credits_remaining: number;
    credits_reset_at: Date;
  };
  request_parameters: {
    type: string;
    amazon_domain: string;
    refinements: string;
    category_id: number;
  };
  request_metadata: {
    created_at: Date;
    processed_at: Date;
    total_time_taken: number;
    amazon_url?: string;
    pages?: RainforestPageRequestMetadata[];
  };
  pagination?: {
    total_results?: number;
    current_page?: number;
    next_page_link?: string;
    total_pages?: number;
    pages?: RainforestPaginationMetadata[];
  };
  refinements?: {
    departments: RainforestRefinement[];
    child_categories: RainforestRefinement[];
  };
}

class RainforestRefinement {
  name: string;
  value: string;
  link: string;
  refinement_display_name: string;
}

class RainforestPageRequestMetadata {
  created_at: Date;
  processed_at: Date;
  total_time_taken: number;
  page: number;
  amazon_url: string;
}

class RainforestPaginationMetadata {
  total_results: number;
  current_page: number;
  next_page_link: string;
  total_pages: number;
}
