import { Product } from '@app/products/model/product.entity';
import { ProviderKey } from '../../providers/model/enum/provider-key.enum';
import { ProviderCategory } from '../../providers/model/provider-category.entity';

export interface Integrator {
  providerKey: ProviderKey;

  getCategoryProductList: (category: ProviderCategory) => Promise<Product[]>;
  getProductDetail: (providerProductId: string) => Promise<Product>;
}
