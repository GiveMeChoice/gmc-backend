export interface RainforestApiProductDto {
  request_metadata: {
    created_at: Date;
    processed_at: Date;
    total_time_taken: number;
    amazon_url: string;
  };
  product: {
    title: string;
    asin: string;
    link: string;
    brand: string;
    categories: [
      {
        name: string;
        link: string;
        category_id: string;
      },
    ];
    delivery_message: string;
    description: string;
    promotions_feature: string;
    rating: number;
    rating_breakdown: {
      five_star: {
        count: number;
      };
      four_star: {
        count: number;
      };
      three_star: {
        count: number;
      };
      two_star: {
        count: number;
      };
      one_star: {
        count: number;
      };
    };
    ratings_total: number;
    main_image: {
      link: string;
    };
    images: [
      {
        link: string;
        variant: string;
      },
    ];
    feature_bullets: string[];
    attributes: [
      {
        name: string;
        value: string;
      },
    ];
    buybox_winner: {
      new_offers_from: {
        symbol: string;
        value: number;
        currency: string;
        raw: string;
      };
      is_prime: boolean;
      is_amazon_fresh: boolean;
      availability: {
        tye: string;
        raw: string;
        dispatch_days: number;
      };
      price: {
        symbol: string;
        value: number;
        currency: string;
        raw: string;
      };
      rrp: {
        symbol: string;
        value: number;
        currency: string;
        raw: string;
      };
      save: {
        symbol: string;
        value: number;
        currency: string;
        raw: string;
      };
      shipping: {
        raw: string;
      };
    };
  };
  climate_pledge_friendly: {
    text: string;
    image: string;
  };
  brand_store: {
    id: string;
    link: string;
  };
}
