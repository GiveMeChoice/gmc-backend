import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { Product } from '@app/provider-integration/model/product.entity';
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
      const product: Partial<Product> = {
        providerProductId: item.result.category_results.asin,
      };
      product.price = Number(item.result.category_results.price.value);
      product.currency = item.result.category_results.price.currency;
      product.title = item.result.category_results.title;
      return product;
    } catch (err) {
      throw new PipelineError('TRANSFORM_ERROR', err);
    }
  }

  mapProductDetails(dto: RainforestApiProductDto): Partial<Product> {
    try {
      const product: Partial<Product> = {};
      product.title = dto.product.title;
      product.rating = dto.product.rating;
      product.ratingsTotal = dto.product.ratings_total;
      product.brandName = dto.product.brand;
      product.link = dto.product.link;
      product.price = dto.product.buybox_winner.price.value;
      product.currency = dto.product.buybox_winner.price.currency;
      product.image = dto.product.main_image.link;
      return product;
    } catch (err) {
      throw new PipelineError('TRANSFORM_ERROR', err);
    }
  }
}
