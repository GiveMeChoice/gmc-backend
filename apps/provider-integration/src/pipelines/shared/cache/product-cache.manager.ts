import { ProviderKey } from '@app/provider-integration/providers/model/enum/provider-key.enum';
import { S3Service } from '@lib/aws/services/s3.service';
import { Injectable, Logger } from '@nestjs/common';
import { CachedResponse } from './interface/cached-response.interface';

@Injectable()
export class ProductCacheManager {
  constructor(private readonly s3Service: S3Service) {}

  async get<T>(
    provider: ProviderKey,
    productId: string,
  ): Promise<CachedResponse<T>> {
    try {
      const cachedRaw = await this.s3Service.getObject(
        this.buildKey(provider, productId),
      );
      Logger.debug('cache hit');
      return JSON.parse(cachedRaw) as CachedResponse<T>;
    } catch (err) {
      Logger.debug('cache miss');
      return null;
    }
  }

  async put<T>(
    provider: ProviderKey,
    productId: string,
    data: T,
  ): Promise<void> {
    const toCache: CachedResponse<T> = {
      retrievedAt: new Date(),
      data,
    };
    await this.s3Service.putObject(
      this.buildKey(provider, productId),
      JSON.stringify(toCache),
    );
    Logger.debug('cache save');
  }

  private buildKey(provider: ProviderKey, productId: string): string {
    return `cache/${provider}/${productId}.json`;
  }
}
