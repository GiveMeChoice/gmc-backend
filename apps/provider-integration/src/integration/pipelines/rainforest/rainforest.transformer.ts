import { Product } from '@lib/products/model/product.entity';
import { ProviderKey } from '@app/provider-integration/providers/model/enum/provider-key.enum';
import { Injectable } from '@nestjs/common';
import { SourceTransformer } from '../../shared/transformer/transformer.interface';
import { RainforestCategoryItem } from './dto/rainforest-category-item.dto';
import { RainforestProductResponse } from './dto/rainforest-product.response';
import { ProductStatus } from '@lib/products/model/enum/product-status.enum';

@Injectable()
export class RainforestTransformer
  implements
    SourceTransformer<RainforestCategoryItem, RainforestProductResponse>
{
  providerKey: ProviderKey = ProviderKey.RAINFOREST_API;

  fromSourceItem(item: RainforestCategoryItem): Partial<Product> {
    const product = new Product();
    product.providerKey = this.providerKey;
    product.providerProductId = item.result.category_results.asin;
    product.status = ProductStatus.INCOMPLETE;
    product.title = item.result.category_results.title;
    product.rating = item.result.category_results.rating
      ? Number(item.result.category_results.rating)
      : null;
    product.ratingsTotal = item.result.category_results.ratings_total
      ? Number(item.result.category_results.ratings_total)
      : null;
    product.price = item.result.category_results.price.value
      ? Number(item.result.category_results.price.value)
      : null;
    product.currency = item.result.category_results.price.currency;
    product.image = item.result.category_results.image;
    product.link = item.result.category_results.link;
    return product;
  }

  fromProductDetail(response: RainforestProductResponse): Partial<Product> {
    const product = new Product();
    product.providerKey = this.providerKey;
    // product.providerProductId = response.product;
    product.status = ProductStatus.COMPLETE;
    return product;
  }
}
