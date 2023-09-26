import { ProviderProductDataDto } from '@app/provider-integration/etl/dto/provider-product-data.dto';
import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { Product } from '@app/provider-integration/model/product.entity';
import { Injectable } from '@nestjs/common';
import { SharedLoader } from '../../loader/shared.loader';

@Injectable()
export class EthicalSuperstoreLoader extends SharedLoader {
  protected isOfferUpdated(
    sourceItem: ProviderProductDataDto,
    product: Product,
  ): boolean {
    return sourceItem.price && sourceItem.price != product.price;
  }

  protected pickOfferUpdatedSourceFields(
    sourceItem: ProviderProductDataDto,
  ): ProviderProductDataDto {
    return {
      price: sourceItem.price,
    };
  }

  providerKey: ProviderKey = ProviderKey.ETHICAL_SUPERSTORE;
}
