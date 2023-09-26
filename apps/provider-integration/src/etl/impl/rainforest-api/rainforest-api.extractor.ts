import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { Channel } from '@app/provider-integration/model/channel.entity';
import { Product } from '@app/provider-integration/model/product.entity';
import { S3Service } from '@lib/aws/services/s3.service';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom, map, Observable, tap } from 'rxjs';
import { Readable } from 'stream';
import { ProductCacheManager } from '../../cache/product-cache.manager';
import { PipelineError } from '../../exception/pipeline.error';
import { ExtractResult } from '../../extractor/extract-result.interface';
import { Extractor } from '../../extractor/extractor.interface';
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
  implements Extractor<Promise<SourceStream>, RainforestApiProductDto>
{
  private readonly logger = new Logger(RainforestApiExtractor.name);

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
    this._apiKey = configService.get('RAINFOREST_API_KEY');
    this._zipCode = configService.get('providers.rainforest.zip-code');
    this.logger.debug('zip code: ' + this._zipCode);
  }

  async extractChannel(source: Channel): Promise<SourceStream> {
    try {
      const sourceKey = await lastValueFrom(
        this.fetchLatestCollectionResultKey(source.etlCode1),
      );
      this.logger.debug('Fetching latest collection result key', sourceKey);
      return {
        stream: await this.s3Service.getObjectStream(
          sourceKey.key,
          'gmc-rainforest-api',
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
    const url = `${RainforestApiExtractor.BASE_URL}/collections/${collectionId}/`;
    return this.httpService
      .get<RainforestApiCollectionDto>(url, {
        params: {
          api_key: this._apiKey,
        },
      })
      .pipe(
        map((res) => res.data.collection),
        map((collection) => ({
          key: `${collectionId}/Collection_Results_${collectionId}_${
            collection.next_result_set_id - 1
          }_Page_1_5fa4c58bb77800b802dcec939eb1cf31abf80fb4.csv`,
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
            product.merchantProductCode,
          );
      return cachedResponse
        ? {
            sourceDate: cachedResponse.retrievedAt,
            fromCache: true,
            data: cachedResponse.data,
          }
        : await lastValueFrom(
            this.fetchProduct(
              product.merchantProductCode,
              product.channel,
            ).pipe(
              map((data) => ({
                sourceDate: new Date(),
                fromCache: false,
                data,
              })),
              tap((result) =>
                this.cacheManager.put(
                  this.providerKey,
                  product.merchantProductCode,
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
    // delete dto.product.variants;
    delete dto.product.videos;
    delete dto.product.videos_flat;
    delete dto.product.keywords;
    delete dto.product.keywords_list;
    // delete dto.product.a_plus_content;
    // delete dto.product.sub_title;
    delete dto.product.rating_breakdown;
    delete dto.product.promotions_feature;
    delete dto.product.has_coupon;
    delete dto.product.coupon_text;
    delete dto.product.images_count;
    delete dto.product.images_flat;
    delete dto.product.feature_bullets_flat;
    // delete dto.product.specifications;
    delete dto.product.specifications_flat;
    if (dto.product.top_reviews) {
      dto.product.top_reviews.forEach((r) => delete r.body_html);
    }
    return dto;
  }

  private fetchProduct(
    asin: string,
    channel: Channel,
  ): Observable<RainforestApiProductDto> {
    return this.httpService
      .get<RainforestApiProductDto>(
        `${RainforestApiExtractor.BASE_URL}/request`,
        {
          params: {
            api_key: this._apiKey,
            type: 'product',
            amazon_domain: channel.etlCode2,
            asin,
            include_html: false,
            zip_code: channel.etlCode3 ? channel.etlCode3 : '',
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
