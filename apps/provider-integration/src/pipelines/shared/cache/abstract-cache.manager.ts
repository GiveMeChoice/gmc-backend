import { S3Service } from '@lib/aws/services/s3.service';
import { Injectable, Logger } from '@nestjs/common';
import { CachedResponse } from './interface/cached-response.interface';

@Injectable()
export abstract class AbstractCacheManager {
  constructor(private readonly s3Service: S3Service) {}

  protected async getInternal<T>(key: string): Promise<CachedResponse<T>> {
    try {
      const cachedRaw = await this.s3Service.getObject(key);
      Logger.debug('cache hit');
      return JSON.parse(cachedRaw) as CachedResponse<T>;
    } catch (err) {
      Logger.debug('cache miss');
      return null;
    }
  }

  protected async putInternal<T>(key: string, data: T): Promise<void> {
    const toCache: CachedResponse<T> = {
      retrievedAt: new Date(),
      data,
    };
    await this.s3Service.putObject(key, JSON.stringify(toCache));
    Logger.debug('cache save');
  }
}
