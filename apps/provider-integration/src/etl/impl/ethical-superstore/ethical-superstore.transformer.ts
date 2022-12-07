import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { Label } from '@app/provider-integration/model/label.entity';
import { Product } from '@app/provider-integration/model/product.entity';
import { Injectable, Logger } from '@nestjs/common';
import { PipelineError } from '../../shared/exception/pipeline.error';
import { ExtractResult } from '../../shared/extractor/extract-result.interface';
import { SourceTransformer } from '../../shared/transformer/transformer.interface';
import {
  EthicalSuperstoreEthicsAndTagsDto,
  EthicalSuperstoreProductDto,
} from './dto/ethical-superstore-product.dto';
import { EthicalSuperstoreSourceItemDto } from './dto/ethical-superstore-source-item.dto';
import { EthicalSuperstoreExtractor } from './ethical-superstore.extractor';

@Injectable()
export class EthicalSuperstoreTransformer
  implements
    SourceTransformer<
      EthicalSuperstoreSourceItemDto,
      ExtractResult<EthicalSuperstoreProductDto>
    >
{
  providerKey: ProviderKey = ProviderKey.ETHICAL_SUPERSTORE;

  mapSourceItem(item: EthicalSuperstoreSourceItemDto): Partial<Product> {
    try {
      const product: Partial<Product> = {
        providerProductId: item.id,
      };
      product.sku = item.sku;
      product.title = item.name;
      product.price = item.price ? Number(item.price) : null;
      product.currency = product.price ? 'GBP' : null;
      product.brandName = item.brand;
      product.image = item.image;
      product.link = `${EthicalSuperstoreExtractor.BASE_URL}${item.href}`;
      return product;
    } catch (err) {
      throw new PipelineError('TRANSFORM_ERROR', err);
    }
  }

  mapProductDetails(
    extracted: ExtractResult<EthicalSuperstoreProductDto>,
  ): Partial<Product> {
    try {
      const { data, sourceDate } = extracted;
      const product: Partial<Product> = {};
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
      description: tag.href,
      icon: `https://www.ethicalsuperstore.com${tag.icon}`,
    }));
  }
}
