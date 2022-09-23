import { ProviderKey } from '@app/provider-integration/providers/model/enum/provider-key.enum';
import { ProviderSource } from '@app/provider-integration/providers/model/provider-source.entity';
import { Injectable } from '@nestjs/common';
import { AbstractCacheManager } from './abstract-cache.manager';
import { CachedResponse } from './interface/cached-response.interface';

@Injectable()
export class SourceCacheManager extends AbstractCacheManager {
  async get<T>(source: ProviderSource): Promise<CachedResponse<T>> {
    return await this.getInternal(
      this.buildSourceKey(source.provider.key, source.identifier),
    );
  }

  async put<T>(source: ProviderSource, data: T): Promise<void> {
    await this.putInternal(
      this.buildSourceKey(source.provider.key, source.identifier),
      data,
    );
  }

  private buildSourceKey(
    provider: ProviderKey,
    sourceIdentifier: string,
  ): string {
    return `cache/${provider}/sources/${sourceIdentifier}.json`;
  }
}
