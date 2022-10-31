import { ProviderKey } from '@app/provider-integration/providers/model/enum/provider-key.enum';
import { ProductStatus } from '@lib/products/model/enum/product-status.enum';
import { Product } from '@lib/products/model/product.entity';
import { Injectable } from '@nestjs/common';
import { PipelineError } from '../../shared/exception/pipeline.error';
import { SourceTransformer } from '../../shared/transformer/transformer.interface';
import { RainforestApiProductDto } from './dto/rainforest-api-product.dto';
import { RainforestApiSourceItemDto } from './dto/rainforest-api-source-item.dto';

@Injectable()
export class RainforestApiTransformer
  implements
    SourceTransformer<RainforestApiSourceItemDto, RainforestApiProductDto>
{
  providerKey: ProviderKey = ProviderKey.RAINFOREST_API;

  mapSourceItem(item: RainforestApiSourceItemDto): Partial<Product> {
    try {
      const product = Product.factory(
        this.providerKey,
        item.result.category_results.asin,
      );
      product.status = ProductStatus.INCOMPLETE;
      return product;
    } catch (err) {
      throw new PipelineError('TRANSFORM_ERROR', err);
    }
  }

  mapProductDetails(dto: RainforestApiProductDto): Partial<Product> {
    try {
      const product = Product.factory();
      product.status = ProductStatus.COMPLETE;
      product.title = dto.product.title;
      product.rating = dto.product.rating;
      product.ratingsTotal = dto.product.ratings_total;
      product.price = dto.product.buybox_winner.price.value;
      product.currency = dto.product.buybox_winner.price.currency;
      product.image = dto.product.main_image.link;
      return product;
    } catch (err) {
      throw new PipelineError('TRANSFORM_ERROR', err);
    }
  }
}
