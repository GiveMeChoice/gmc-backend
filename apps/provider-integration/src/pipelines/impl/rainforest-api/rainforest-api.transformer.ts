import { Product } from '@lib/products/model/product.entity';
import { ProviderKey } from '@app/provider-integration/providers/model/enum/provider-key.enum';
import { Injectable, Logger } from '@nestjs/common';
import { SourceTransformer } from '../../shared/transformer/transformer.interface';
import { RainforestApiSourceItemDto } from './dto/rainforest-api-source-item.dto';
import { RainforestApiProductDto } from './dto/rainforest-api-product.dto';
import { ProductStatus } from '@lib/products/model/enum/product-status.enum';

@Injectable()
export class RainforestApiTransformer
  implements
    SourceTransformer<RainforestApiSourceItemDto, RainforestApiProductDto>
{
  providerKey: ProviderKey = ProviderKey.RAINFOREST_API;

  mapSourceItem(item: RainforestApiSourceItemDto): Partial<Product> {
    const product = new Product();
    product.status = ProductStatus.INCOMPLETE;
    product.providerKey = this.providerKey;
    product.providerId = item.result.category_results.asin;
    return product;
  }

  mapProductDetails(response: RainforestApiProductDto): Partial<Product> {
    const product = new Product();
    product.status = ProductStatus.COMPLETE;
    product.providerKey = this.providerKey;
    product.providerId = response.product.asin;
    product.title = response.product.title;
    product.rating = response.product.rating;
    product.ratingsTotal = response.product.ratings_total;
    product.price = response.product.buybox_winner.price.value;
    product.currency = response.product.buybox_winner.price.currency;
    product.image = response.product.main_image.link;
    return product;
  }
}
