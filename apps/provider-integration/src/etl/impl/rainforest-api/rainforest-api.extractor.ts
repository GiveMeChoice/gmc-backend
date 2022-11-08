import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { ProductSource } from '@app/provider-integration/model/product-source.entity';
import { S3Service } from '@lib/aws/services/s3.service';
import { Product } from '@lib/products/model/product.entity';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom, map, Observable, tap } from 'rxjs';
import { Readable } from 'stream';
import { ProductCacheManager } from '../../shared/cache/product-cache.manager';
import { PipelineError } from '../../shared/exception/pipeline.error';
import { Extractor } from '../../shared/extractor/extractor.interface';
import { RainforestApiCollectionDto } from './dto/rainforest-api-collection.dto';
import { RainforestApiProductDto } from './dto/rainforest-api-product.dto';

@Injectable()
export class RainforestApiExtractor
  implements Extractor<Promise<Readable>, Promise<RainforestApiProductDto>>
{
  public static readonly BASE_URL = 'https://api.rainforestapi.com';
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
  async extractSource(source: ProductSource): Promise<Readable> {
    try {
      const sourceKey = await lastValueFrom(
        this.fetchLatestCollectionResultKey(source.identifier),
      );
      return await this.s3Service.getObjectStream(sourceKey, this.providerKey);
    } catch (err) {
      throw new PipelineError('EXTRACT_ERROR', err);
    }
  }

  private fetchLatestCollectionResultKey(
    collectionId: string,
  ): Observable<string> {
    return this.httpService
      .get<RainforestApiCollectionDto>(
        `${RainforestApiExtractor.BASE_URL}/collections/${collectionId}/`,
        {
          params: {
            api_key: this._apiKey,
          },
        },
      )
      .pipe(
        map((res) => res.data.collection.next_result_set_id - 1),
        map(
          (resultId) =>
            `${collectionId}/Collection_Results_${collectionId}_${resultId}_Page_1_bb6d6dbffba33cbcecd3f56639ac8792d2ddd200.csv`,
        ),
      );
  }

  async extractProduct(
    product: Product,
    skipCache: boolean,
  ): Promise<RainforestApiProductDto> {
    try {
      const cachedResponse = skipCache
        ? null
        : await this.cacheManager.get<RainforestApiProductDto>(
            this.providerKey,
            product.providerProductId,
          );
      return cachedResponse
        ? cachedResponse.data
        : await lastValueFrom(
            this.fetchProduct(product.providerProductId).pipe(
              tap((data) =>
                this.cacheManager.put(
                  this.providerKey,
                  product.providerProductId,
                  this.removeUnusedElements(data),
                ),
              ),
            ),
          );
    } catch (err) {
      throw new PipelineError('EXTRACT_ERROR', err);
    }
  }

  private removeUnusedElements(
    dto: RainforestApiProductDto,
  ): RainforestApiProductDto {
    delete dto.request_info;
    delete dto.request_parameters;
    delete dto.request_metadata;
    delete dto.sponsored_products;
    delete dto.frequently_bought_together;
    delete dto.compare_with_similar;
    delete dto.also_viewed;
    delete dto.also_bought;
    delete dto.product.variants;
    delete dto.product.videos;
    delete dto.product.videos_flat;
    delete dto.product.feature_bullets_flat;
    delete dto.product.specifications;
    delete dto.product.specifications_flat;
    if (dto.product.top_reviews) {
      dto.product.top_reviews.forEach((r) => delete r.body_html);
    }
    return dto;
  }

  private fetchProduct(asin: string): Observable<RainforestApiProductDto> {
    return this.httpService
      .get<RainforestApiProductDto>(
        `${RainforestApiExtractor.BASE_URL}/request`,
        {
          params: {
            api_key: this._apiKey,
            type: 'product',
            amazon_domain: 'amazon.co.uk',
            asin,
            include_html: false,
            zip_code: this._zipCode,
          },
        },
      )
      .pipe(
        map((res) => {
          return res.data;
        }),
      );
  }
}
