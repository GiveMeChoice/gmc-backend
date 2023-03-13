import { ProductDataDto } from '@app/provider-integration/model/dto/product-data.dto';
import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { Product } from '@app/provider-integration/model/product.entity';
import { Injectable } from '@nestjs/common';
import { SharedLoader } from '../shared/shared.loader';

@Injectable()
export class EthicalSuperstoreLoader extends SharedLoader {
  protected isOfferUpdated(
    sourceItem: ProductDataDto,
    product: Product,
  ): boolean {
    return sourceItem.price && sourceItem.price != product.price;
  }

  protected pickOfferUpdatedSourceFields(
    sourceItem: ProductDataDto,
  ): ProductDataDto {
    return {
      price: sourceItem.price,
    };
  }

  providerKey: ProviderKey = ProviderKey.ETHICAL_SUPERSTORE;
}
