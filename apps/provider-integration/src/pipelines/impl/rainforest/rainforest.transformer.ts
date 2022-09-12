import { Product } from '@app/products/model/product.entity';
import { SourceTransformer } from '../../shared/transform/transformer.interface';
import { RainforestCategoryItem } from './dto/rainforest-category-item.dto';

export class RainforestTransformer
  implements SourceTransformer<RainforestCategoryItem, any>
{
  mapCategoryItem(item: RainforestCategoryItem): Partial<Product> {
    return {
      providerProductId: item.result.category_results.asin,
      title: item.result.category_results.title,
      rating: item.result.category_results.rating,
      ratingsTotal: item.result.category_results.ratings_total,
      price: item.result.category_results.price.value,
      currency: item.result.category_results.price.currency,
      image: item.result.category_results.image,
      link: item.result.category_results.link,
    };
  }
  mapProduct(product: any): Partial<Product> {
    throw new Error('Method not implemented.');
  }
}
