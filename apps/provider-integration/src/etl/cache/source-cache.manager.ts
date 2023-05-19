import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { Channel } from '@app/provider-integration/model/channel.entity';
import { Injectable } from '@nestjs/common';
import { AbstractCacheManager } from './abstract-cache.manager';
import { CachedResponse } from './interface/cached-response.interface';

@Injectable()
export class SourceCacheManager extends AbstractCacheManager {
  async get<T>(source: Channel): Promise<CachedResponse<T>> {
    return await this.getInternal(
      this.buildSourceKey(source.provider.key, source.id),
    );
  }

  async put<T>(source: Channel, data: T): Promise<void> {
    await this.putInternal(
      this.buildSourceKey(source.provider.key, source.id),
      data,
    );
  }

  private buildSourceKey(provider: ProviderKey, sourceId: string): string {
    return `${provider}/sources/${sourceId}.json`;
  }
}
