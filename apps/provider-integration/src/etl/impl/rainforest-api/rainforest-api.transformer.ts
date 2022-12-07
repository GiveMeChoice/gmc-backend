import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { Label } from '@app/provider-integration/model/label.entity';
import { Product } from '@app/provider-integration/model/product.entity';
import { Injectable } from '@nestjs/common';
import { PipelineError } from '../../shared/exception/pipeline.error';
import { ExtractResult } from '../../shared/extractor/extract-result.interface';
import { SourceTransformer } from '../../shared/transformer/transformer.interface';
import {
  RainforestApiClimatePledgeFriendlyDto,
  RainforestApiProductDto,
} from './dto/rainforest-api-product.dto';
import { RainforestApiSourceItemDto } from './dto/rainforest-api-source-item.dto';

@Injectable()
export class RainforestApiTransformer
  implements
    SourceTransformer<
      RainforestApiSourceItemDto,
      ExtractResult<RainforestApiProductDto>
    >
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

  mapProductDetails(
    extracted: ExtractResult<RainforestApiProductDto>,
  ): Partial<Product> {
    const { data, sourceDate } = extracted;
    try {
      const product: Partial<Product> = {};
      product.title = data.product.title;
      product.rating = data.product.rating;
      product.ratingsTotal = data.product.ratings_total;
      product.brandName = data.product.brand;
      product.link = data.product.link;
      product.price = data.product.buybox_winner.price.value;
      product.currency = 'USD';
      // product.currency = data.product.buybox_winner.price.currency;
      product.image = data.product.main_image.link;
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
