import { Product } from '@lib/products/model/product.entity';
import { ProviderKey } from '@app/provider-integration/providers/model/enum/provider-key.enum';
import { Injectable } from '@nestjs/common';
import { SourceTransformer } from '../../shared/transform/transformer.interface';
import { RainforestCategoryItem } from './dto/rainforest-category-item.dto';
import { RainforestProductResponse } from './dto/rainforest-product.response';

@Injectable()
export class RainforestTransformer
  implements
    SourceTransformer<RainforestCategoryItem, RainforestProductResponse>
{
  providerKey: ProviderKey = ProviderKey.RAINFOREST_API;
  fromSourceItem(item: RainforestCategoryItem): Partial<Product> {
    return {
      providerProductId: item.result.category_results.asin,
      title: item.result.category_results.title,
      rating: item.result.category_results.rating
        ? Number(item.result.category_results.rating)
        : null,
      ratingsTotal: item.result.category_results.ratings_total
        ? Number(item.result.category_results.ratings_total)
        : null,
      price: item.result.category_results.price.value
        ? Number(item.result.category_results.price.value)
        : null,
      currency: item.result.category_results.price.currency,
      image: item.result.category_results.image,
      link: item.result.category_results.link,
    };
  }

  fromProductDetail(response: RainforestProductResponse): Partial<Product> {
    throw new Error('Method not implemented.');
  }
}
