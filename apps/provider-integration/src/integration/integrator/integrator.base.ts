import { Product } from '@app/products/model/product.entity';
import { ProviderKey } from '@app/provider-integration/providers/model/enum/provider-key.enum';
import { ProviderCategory } from '@app/provider-integration/providers/model/provider-category.entity';
import { Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Integrator } from './integrator.interface';

export abstract class IntegratorBase implements Integrator {
  providerKey: ProviderKey;

  @Inject(ConfigService)
  private readonly configService: ConfigService;

  async getCategoryProductList(category: ProviderCategory) {
    Logger.debug(
      `Fetching Category Product List from Provider: ${this.providerKey}`,
    );
    Logger.debug(`Category: ${category.description}`);
    const products = await this.getCategoryProductListInternal(category);
    Logger.debug(`Found ${products.length} Products`);
    return products;
  }

  abstract getCategoryProductListInternal(
    category: ProviderCategory,
  ): Promise<Product[]>;

  async getProductDetail(providerProductId: string) {
    return null;
  }
}
