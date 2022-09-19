import { ProviderKey } from '@app/provider-integration/providers/model/enum/provider-key.enum';
import { ProviderSource } from '@app/provider-integration/providers/model/provider-source.entity';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Extractor } from '../../shared/extractor/extractor.interface';
import { EthicalSuperstoreProduct } from './dto/ethical-superstore-product.dto';
import { EthicalSuperstoreSourceItem } from './dto/ethical-superstore-source-item.dto';

@Injectable()
export class EthicalSuperstoreExtractor
  implements
    Extractor<
      Observable<EthicalSuperstoreSourceItem>,
      EthicalSuperstoreProduct
    >
{
  providerKey: ProviderKey = ProviderKey.ETHICAL_SUPERSTORE;

  constructor(private readonly httpService: HttpService) {}

  extractSource(
    source: ProviderSource,
  ): Observable<EthicalSuperstoreSourceItem> {
    this.httpService
      .get(
        `https://www.ethicalsuperstore.com/category/${source.identifier}/?limit=192`,
      )
      .pipe(map((res) => res.data))
      .subscribe((data) => {
        Logger.debug(data);
      });
    return null;
    throw new Error('Method not implemented.');
  }
  extractProduct(providerProductId: string): EthicalSuperstoreProduct {
    throw new Error('Method not implemented.');
  }
}
