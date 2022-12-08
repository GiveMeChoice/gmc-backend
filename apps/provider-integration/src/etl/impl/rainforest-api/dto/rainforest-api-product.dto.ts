export interface RainforestApiProductDto {
  // unused
  request_info: any;
  request_parameters: any;
  request_metadata: any;
  sponsored_products: any;
  frequently_bought_together: any;
  compare_with_similar: any;
  also_viewed: any;
  also_bought: any;
  // keep
  brand_store: {
    id: string;
    link: string;
  };
  climate_pledge_friendly: RainforestApiClimatePledgeFriendlyDto;
  product: {
    // unused
    variants: any;
    videos: any;
    videos_flat: any;
    feature_bullets_flat: [string];
    specifications: any;
    specifications_flat: any;
    // keep
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
    categories_flat: string;
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
    top_reviews: RainforestApiTopReviewDto[];
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
}

export interface RainforestApiImageDto {
  link: string;
  variant: string;
}

export interface RainforestApiClimatePledgeFriendlyDto {
  text: string;
  image: string;
}

export interface RainforestApiTopReviewDto {
  id: string;
  title: string;
  body: string;
  body_html: string;
  link: string;
  rating: number;
  date: {
    raw: string;
    utc: Date;
  };
  profile: {
    name: string;
    link: string;
    id: string;
  };
}
