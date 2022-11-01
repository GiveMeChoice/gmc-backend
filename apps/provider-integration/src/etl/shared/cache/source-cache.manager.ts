import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { ProductSource } from '@app/provider-integration/model/product-source.entity';
import { Injectable } from '@nestjs/common';
import { AbstractCacheManager } from './abstract-cache.manager';
import { CachedResponse } from './interface/cached-response.interface';

@Injectable()
export class SourceCacheManager extends AbstractCacheManager {
  async get<T>(source: ProductSource): Promise<CachedResponse<T>> {
    return await this.getInternal(
      this.buildSourceKey(source.provider.id, source.identifier),
    );
  }

  async put<T>(source: ProductSource, data: T): Promise<void> {
    await this.putInternal(
      this.buildSourceKey(source.provider.id, source.identifier),
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
