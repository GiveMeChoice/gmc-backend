import {
  ProductDataDto,
  SourceItemDataDto,
} from '@app/provider-integration/model/dto/product-data.dto';
import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { Label } from '@app/provider-integration/model/label.entity';
import { Injectable } from '@nestjs/common';
import { PipelineError } from '../../shared/exception/pipeline.error';
import { SourceTransformer } from '../../shared/transformer/transformer.interface';
import {
  RainforestApiClimatePledgeFriendlyDto,
  RainforestApiProductDto,
} from './dto/rainforest-api-product.dto';
import { RainforestApiSourceItemDto } from './dto/rainforest-api-source-item.dto';

@Injectable()
export class RainforestApiTransformer
  implements
    SourceTransformer<RainforestApiSourceItemDto, RainforestApiProductDto>
{
  providerKey: ProviderKey = ProviderKey.RAINFOREST_API;

  mapSourceItem(item: RainforestApiSourceItemDto): SourceItemDataDto {
    try {
      const product: SourceItemDataDto = {
        providerProductId: item.result.category_results.asin,
      };
      product.price = Number(item.result.category_results.price.value);
      product.listImage = item.result.category_results.image;
      product.offerLink = item.result.category_results.link;
      return product;
    } catch (err) {
      throw new PipelineError('TRANSFORM_ERROR', err);
    }
  }

  mapProductData(data: RainforestApiProductDto): ProductDataDto {
    try {
      const product: ProductDataDto = {};
      product.title = data.product.title;
      product.rating = data.product.rating;
      product.ratingsTotal = data.product.ratings_total;
      product.brandName = data.product.brand;
      product.offerLink = data.product.link;
      product.price = data.product.buybox_winner.price.value;
      product.currency = 'USD';
      // product.currency = data.product.buybox_winner.price.currency;
      product.mainImage = data.product.main_image.link;
      product.labels = this.mapLabels(data.climate_pledge_friendly) as Label[];
      return product;
    } catch (err) {
      throw new PipelineError('TRANSFORM_ERROR', err);
    }
  }

  private mapLabels(
    climatePledge: RainforestApiClimatePledgeFriendlyDto,
  ): Partial<Label>[] {
    return [
      {
        title: climatePledge.text,
        icon: climatePledge.image,
      },
    ];
  }
}
