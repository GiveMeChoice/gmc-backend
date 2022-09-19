import { ProviderKey } from '@app/provider-integration/providers/model/enum/provider-key.enum';
import { ProviderSource } from '@app/provider-integration/providers/model/provider-source.entity';
import { S3Service } from '@lib/aws/services/s3.service';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom, map, tap } from 'rxjs';
import { Readable } from 'stream';
import { ProductCacheManager } from '../../shared/cache/product-cache.manager';
import { Extractor } from '../../shared/extractor/extractor.interface';
import { RainforestApiCollectionDto } from './dto/rainforest-api-collection.dto';
import { RainforestApiProductDto } from './dto/rainforest-api-product.dto';

@Injectable()
export class RainforestApiExtractor
  implements Extractor<Promise<Readable>, Promise<RainforestApiProductDto>>
{
  private readonly _apiKey: string;
  private readonly _zipCode: string;

  constructor(
    private readonly s3Service: S3Service,
    private readonly httpService: HttpService,
    private readonly cacheManager: ProductCacheManager,
    configService: ConfigService,
  ) {
    this._apiKey = configService.get('rainforest.api-key');
    this._zipCode = configService.get('rainforest.zip-code');
  }

  providerKey: ProviderKey = ProviderKey.RAINFOREST_API;
  async extractSource(source: ProviderSource): Promise<Readable> {
    const sourceKey = await this.fetchLatestCollectionResultKey(
      source.identifier,
    );
    Logger.debug(`Extracting rainforest source at key: ${sourceKey}`);
    return await this.s3Service.getObjectStream(sourceKey, this.providerKey);
  }

  private async fetchLatestCollectionResultKey(
    collectionId: string,
  ): Promise<string> {
    Logger.debug(`https://api.rainforestapi.com/collections/${collectionId}/`);
    return await lastValueFrom(
      this.httpService
        .get<RainforestApiCollectionDto>(
          `https://api.rainforestapi.com/collections/${collectionId}/`,
          {
            params: {
              api_key: this._apiKey,
            },
          },
        )
        .pipe(
          map((res) => res.data.collection.results_count),
          map(
            (resultId) =>
              `${collectionId}/Collection_Results_${collectionId}_${resultId}_Page_1_bb6d6dbffba33cbcecd3f56639ac8792d2ddd200.csv`,
          ),
        ),
    );
  }

  async extractProduct(productId: string): Promise<RainforestApiProductDto> {
    const cachedResponse = await this.cacheManager.get<RainforestApiProductDto>(
      this.providerKey,
      productId,
    );
    return cachedResponse
      ? cachedResponse.data
      : await this.fetchProductFromAPI(productId);
  }

  private async fetchProductFromAPI(
    productId,
  ): Promise<RainforestApiProductDto> {
    return await lastValueFrom(
      this.httpService
        .get<RainforestApiProductDto>('https://api.rainforestapi.com/request', {
          params: {
            api_key: this._apiKey,
            type: 'product',
            amazon_domain: 'amazon.co.uk',
            asin: productId,
            include_html: false,
            zip_code: this._zipCode,
          },
        })
        .pipe(
          map((res) => {
            return res.data;
          }),
          tap(async (data) => {
            await this.cacheManager.put(this.providerKey, productId, data);
          }),
        ),
    );
  }
}
