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
  EthicalSuperstoreEthicsAndTagsDto,
  EthicalSuperstoreProductDto,
} from './dto/ethical-superstore-product.dto';
import { EthicalSuperstoreSourceItemDto } from './dto/ethical-superstore-source-item.dto';
import { ETHICAL_SUPERSTORE_BASE_URL } from './ethical-superstore.constants';

@Injectable()
export class EthicalSuperstoreTransformer
  implements
    SourceTransformer<
      EthicalSuperstoreSourceItemDto,
      EthicalSuperstoreProductDto
    >
{
  providerKey: ProviderKey = ProviderKey.ETHICAL_SUPERSTORE;

  mapSourceItem(item: EthicalSuperstoreSourceItemDto): SourceItemDataDto {
    try {
      const product: SourceItemDataDto = {
        providerProductId: item.id,
      };
      // product.sku = item.sku;
      // product.title = item.name;
      // product.currency = product.price ? 'GBP' : null;
      // product.brandName = item.brand;
      product.price = item.price ? Number(item.price) : null;
      product.listImage = item.image;
      product.offerLink = `${ETHICAL_SUPERSTORE_BASE_URL}${item.href}`;
      return product;
    } catch (err) {
      throw new PipelineError('TRANSFORM_ERROR', err);
    }
  }

  mapProductData(data: EthicalSuperstoreProductDto): ProductDataDto {
    try {
      const product: ProductDataDto = {};
      product.rating = data.rating;
      product.labels = this.mapLabels(data.ethicsAndTags) as Label[];
      return product;
    } catch (err) {
      throw new PipelineError('TRANSFORM_ERROR', err);
    }
  }

  private mapLabels(
    ethicsAndTags: EthicalSuperstoreEthicsAndTagsDto[],
  ): Partial<Label>[] {
    return ethicsAndTags.map((tag) => ({
      title: tag.title,
      infoLink: `${ETHICAL_SUPERSTORE_BASE_URL}${tag.href}`,
      icon: `${ETHICAL_SUPERSTORE_BASE_URL}${tag.icon}`,
    }));
  }
}
