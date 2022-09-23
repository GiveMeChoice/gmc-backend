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
  inStock?: boolean;
  images?: {
    url: string;
    isPrimary: boolean;
  }[];
  ethicsAndTags?: {
    title: string;
    href: string;
    icon: string;
  }[];
  manufacturer?: {
    name: string;
    logo: string;
    description: string;
  };
}
