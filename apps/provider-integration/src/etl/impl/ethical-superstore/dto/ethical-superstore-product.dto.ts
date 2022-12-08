export interface EthicalSuperstoreProductDto {
  productInfo?: {
    id?: string;
    description?: string;
    title: string;
    brand: string;
    productCollectionHref: string;
    productCodeText: string;
    price: {
      price: number;
      currency: string;
    };
  };
  rating?: number;
  reviewCount?: number;
  reviews?: EthicalSuperstoreReviewDto[];
  inStock?: boolean;
  images?: {
    url: string;
    isPrimary: boolean;
  }[];
  ethicsAndTags?: EthicalSuperstoreEthicsAndTagsDto[];
  manufacturer?: {
    name: string;
    logo: string;
    description: string;
  };
}

export interface EthicalSuperstoreReviewDto {
  author: string;
  submittedOn: Date;
  rating: number;
  text: string;
}

export interface EthicalSuperstoreEthicsAndTagsDto {
  title: string;
  href: string;
  icon: string;
}
