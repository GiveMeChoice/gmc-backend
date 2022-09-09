import { Product } from '@app/products/model/product.entity';
import { Injectable } from '@nestjs/common';
import { S3Service } from '../aws/services/s3.service';
import { IntegratorBase } from '../integration/integrator/integrator.base';
import { ProviderKey } from '../providers/model/enum/provider-key.enum';
import { ProviderCategory } from '../providers/model/provider-category.entity';

@Injectable()
export class RainforestIntegrator extends IntegratorBase {
  providerKey: ProviderKey = ProviderKey.RAINFOREST_API;

  constructor(private readonly s3Service: S3Service) {
    super();
  }

  getCategoryProductListInternal(
    category: ProviderCategory,
  ): Promise<Product[]> {
    // this.s3Service.getObjectContent()
    return Promise.resolve([]);
  }
}
