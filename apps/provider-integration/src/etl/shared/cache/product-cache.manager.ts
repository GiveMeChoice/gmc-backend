import { ProviderKey } from '@app/provider-integration/providers/model/enum/provider-key.enum';
import { Injectable } from '@nestjs/common';
import { AbstractCacheManager } from './abstract-cache.manager';
import { CachedResponse } from './interface/cached-response.interface';

@Injectable()
export class ProductCacheManager extends AbstractCacheManager {
  async get<T>(
    provider: ProviderKey,
    productId: string,
  ): Promise<CachedResponse<T>> {
    return await this.getInternal(this.buildProductKey(provider, productId));
  }

  async put<T>(
    provider: ProviderKey,
    productId: string,
    data: T,
  ): Promise<void> {
    await this.putInternal(this.buildProductKey(provider, productId), data);
  }

  private buildProductKey(provider: ProviderKey, productId: string): string {
    return `cache/${provider}/products/${productId}.json`;
  }
}
