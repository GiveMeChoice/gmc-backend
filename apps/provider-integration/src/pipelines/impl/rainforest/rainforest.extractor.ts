import { Product } from '@lib/products/model/product.entity';
import { S3Service } from '@lib/aws/services/s3.service';
import { ProviderKey } from '@app/provider-integration/providers/model/enum/provider-key.enum';
import { ProviderSource } from '@app/provider-integration/providers/model/provider-source.entity';
import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import { Extractor } from '../../shared/extractor/extractor.interface';
import { RainforestProductResponse } from './dto/rainforest-product.response';

@Injectable()
export class RainforestExtractor
  implements Extractor<Promise<Readable>, Promise<RainforestProductResponse>>
{
  constructor(private readonly s3Service: S3Service) {}

  providerKey: ProviderKey = ProviderKey.RAINFOREST_API;
  async extractSource(source: ProviderSource): Promise<Readable> {
    const objKey = `${source.category}/category/Collection_Results_D7F6E89A_2_Page_1_bb6d6dbffba33cbcecd3f56639ac8792d2ddd200.csv`;
    return await this.s3Service.getObjectStream(this.providerKey, objKey);
  }

  async extractDetail(product: Product): Promise<RainforestProductResponse> {
    throw new Error('Method not implemented.');
  }
}
