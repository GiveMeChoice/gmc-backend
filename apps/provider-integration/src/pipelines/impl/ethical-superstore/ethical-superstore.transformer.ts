import { ProviderKey } from '@app/provider-integration/providers/model/enum/provider-key.enum';
import { Product } from '@lib/products/model/product.entity';
import { Injectable } from '@nestjs/common';
import { SourceTransformer } from '../../shared/transformer/transformer.interface';
import { EthicalSuperstoreProduct } from './dto/ethical-superstore-product.dto';
import { EthicalSuperstoreSourceItem } from './dto/ethical-superstore-source-item.dto';

@Injectable()
export class EthicalSuperstoreTransformer
  implements
    SourceTransformer<EthicalSuperstoreSourceItem, EthicalSuperstoreProduct>
{
  providerKey: ProviderKey = ProviderKey.ETHICAL_SUPERSTORE;

  mapSourceItem(item: EthicalSuperstoreSourceItem): Partial<Product> {
    throw new Error('Method not implemented.');
  }
  mapProductDetails(product: EthicalSuperstoreProduct): Partial<Product> {
    throw new Error('Method not implemented.');
  }
}
