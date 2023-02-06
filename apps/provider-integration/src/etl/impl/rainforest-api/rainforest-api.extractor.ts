import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { ProductSource } from '@app/provider-integration/model/product-source.entity';
import { Product } from '@app/provider-integration/model/product.entity';
import { S3Service } from '@lib/aws/services/s3.service';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom, map, Observable, tap } from 'rxjs';
import { Readable } from 'stream';
import { ProductCacheManager } from '../../shared/cache/product-cache.manager';
import { PipelineError } from '../../shared/exception/pipeline.error';
import { ExtractResult } from '../../shared/extractor/extract-result.interface';
import { Extractor } from '../../shared/extractor/extractor.interface';
import { RainforestApiCollectionDto } from './dto/rainforest-api-collection.dto';
import { RainforestApiProductDto } from './dto/rainforest-api-product.dto';

type SourceKey = {
  key: string;
  runDate: Date;
};

export type SourceStream = {
  stream: Readable;
  runDate: Date;
};

@Injectable()
export class RainforestApiExtractor
  implements
    Extractor<
      Promise<SourceStream>,
      Promise<ExtractResult<RainforestApiProductDto>>
    >
{
  providerKey: ProviderKey = ProviderKey.RAINFOREST_API;
  public static readonly BASE_URL = 'https://api.rainforestapi.com';
  private readonly _apiKey: string;
  private readonly _zipCode: string;

  constructor(
    private readonly s3Service: S3Service,
    private readonly httpService: HttpService,
    private readonly cacheManager: ProductCacheManager,
    configService: ConfigService,
  ) {
    this._apiKey = configService.get('rainforest.api_key');
    this._zipCode = configService.get('rainforest.zip-code');
  }

  async extractSource(source: ProductSource): Promise<SourceStream> {
    try {
      const sourceKey = await lastValueFrom(
        this.fetchLatestCollectionResultKey(source.identifier),
      );
      return {
        stream: await this.s3Service.getObjectStream(
          sourceKey.key,
          this.providerKey,
        ),
        runDate: sourceKey.runDate,
      };
    } catch (err) {
      throw new PipelineError('EXTRACT_ERROR', err);
    }
  }

  private fetchLatestCollectionResultKey(
    collectionId: string,
  ): Observable<SourceKey> {
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
        map((res) => res.data.collection),
        map((collection) => ({
          key: `${collectionId}/Collection_Results_${collectionId}_${
            collection.next_result_set_id - 1
          }_Page_1_bb6d6dbffba33cbcecd3f56639ac8792d2ddd200.csv`,
          runDate: collection.last_run,
        })),
      );
  }

  async extractProduct(
    product: Product,
    skipCache: boolean,
  ): Promise<ExtractResult<RainforestApiProductDto>> {
    try {
      const cachedResponse = skipCache
        ? null
        : await this.cacheManager.get<RainforestApiProductDto>(
            this.providerKey,
            product.providerProductId,
          );
      return cachedResponse
        ? {
            sourceDate: cachedResponse.retrievedAt,
            fromCache: true,
            data: cachedResponse.data,
          }
        : await lastValueFrom(
            this.fetchProduct(product.providerProductId).pipe(
              map((data) => ({
                sourceDate: new Date(),
                fromCache: false,
                data,
              })),
              tap((result) =>
                this.cacheManager.put(
                  this.providerKey,
                  product.providerProductId,
                  this.removeUnusedElements(result.data),
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
    delete dto.product.keywords;
    delete dto.product.keywords_list;
    delete dto.product.a_plus_content;
    delete dto.product.sub_title;
    delete dto.product.rating_breakdown;
    delete dto.product.promotions_feature;
    delete dto.product.has_coupon;
    delete dto.product.coupon_text;
    delete dto.product.images_count;
    delete dto.product.images_flat;
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
