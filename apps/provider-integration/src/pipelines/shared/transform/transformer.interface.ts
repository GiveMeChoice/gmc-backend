import { Product } from '@app/products/model/product.entity';

export interface SourceTransformer<I, P> {
  mapCategoryItem(item: I): Partial<Product>;
  mapProduct(product: P): Partial<Product>;
}
