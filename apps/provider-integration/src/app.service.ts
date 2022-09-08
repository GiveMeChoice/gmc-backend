import { ProductsService } from '@app/products';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(
    private configService: ConfigService,
    private productService: ProductsService,
  ) {}

  // updateCategory(category: ProviderCategory, providerKey: ProviderKey) {

  //   const integrator: Integrator = ProviderIntegratorFactory.get(providerKey);

  //   const providerIds = await integrator.getCategoryList(category);

  //   if (this.productService.findOne(p))

  // }
}

// class RainforestConnector implements ApiConnector {

//   public fetchProductList(providerCategory: string, page: number): Promise<ApiResponse<provider>> {
//     axios.get()...
//   }

//   public fetchProductDetail(providerProductId: string): Promise<ProviderApiResponse<provider>> {

//   }

// }
