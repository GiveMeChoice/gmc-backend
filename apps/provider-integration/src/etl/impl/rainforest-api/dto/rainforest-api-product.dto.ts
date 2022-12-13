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
    keywords: any;
    keywords_list: any;
    a_plus_content: any;
    sub_title: any;
    promotions_feature: string;
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
    has_coupon: boolean;
    coupon_text: string;
    images_count: number;
    images_flat: string;
    is_bundle: boolean;
    // keep
    title: string;
    asin: string;
    link: string;
    brand: string;
    delivery_message: string;
    categories: [
      {
        name: string;
        link: string;
        category_id: string;
      },
    ];
    categories_flat: string;
    description: string;
    rating: number;
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
        type: string;
        raw: string;
        dispatch_days: number;
      };
      price: RainforestApiPriceDto;
      rrp: RainforestApiPriceDto;
      save: RainforestApiPriceDto;
      shipping: RainforestApiPriceDto;
    };
  };
}

export interface RainforestApiPriceDto {
  raw: string;
  value: number;
  currency: string;
  symbol: string;
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
