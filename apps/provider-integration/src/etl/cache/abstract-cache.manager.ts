import { formatErrorMessage } from '@app/provider-integration/utils/format-error-message';
import { S3Service } from '@lib/aws/services/s3.service';
import { Injectable, Logger } from '@nestjs/common';
import { CachedResponse } from './interface/cached-response.interface';

@Injectable()
export abstract class AbstractCacheManager {
  private readonly logger = new Logger(AbstractCacheManager.name);

  private readonly _cacheBucket: string = 'gmc-cache';

  constructor(private readonly s3Service: S3Service) {}

  protected async getInternal<T>(key: string): Promise<CachedResponse<T>> {
    try {
      const cachedRaw = await this.s3Service.getObject(key, this._cacheBucket);
      this.logger.debug('cache hit: ' + key);
      return JSON.parse(cachedRaw) as CachedResponse<T>;
    } catch (err) {
      this.logger.log('cache miss: ' + key);
      return null;
    }
  }

  protected async putInternal<T>(key: string, data: T): Promise<void> {
    const toCache: CachedResponse<T> = {
      retrievedAt: new Date(),
      data,
    };
    try {
      await this.s3Service.putObject(
        key,
        JSON.stringify(toCache),
        this._cacheBucket,
      );
      this.logger.debug('cache save: ' + key);
    } catch (e) {
      formatErrorMessage(e, 'Cache Save Failure');
    }
  }
}
