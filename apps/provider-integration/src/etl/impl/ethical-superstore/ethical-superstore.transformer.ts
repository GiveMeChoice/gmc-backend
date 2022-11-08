import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { ProductIntegrationStatus } from '@lib/products/model/enum/product-status.enum';
import { Product } from '@lib/products/model/product.entity';
import { Injectable } from '@nestjs/common';
import { PipelineError } from '../../shared/exception/pipeline.error';
import { SourceTransformer } from '../../shared/transformer/transformer.interface';
import { EthicalSuperstoreProductDto } from './dto/ethical-superstore-product.dto';
import { EthicalSuperstoreSourceItemDto } from './dto/ethical-superstore-source-item.dto';
import { EthicalSuperstoreExtractor } from './ethical-superstore.extractor';

@Injectable()
export class EthicalSuperstoreTransformer
  implements
    SourceTransformer<
      EthicalSuperstoreSourceItemDto,
      EthicalSuperstoreProductDto
    >
{
  providerKey: ProviderKey = ProviderKey.ETHICAL_SUPERSTORE;

  mapSourceItem(item: EthicalSuperstoreSourceItemDto): Partial<Product> {
    try {
      const product = Product.factory(this.providerKey, item.id);
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
  mapProductDetails(dto: EthicalSuperstoreProductDto): Partial<Product> {
    try {
      const product = Product.factory();
      product.rating = dto.rating;
      return product;
    } catch (err) {
      throw new PipelineError('TRANSFORM_ERROR', err);
    }
  }
}
