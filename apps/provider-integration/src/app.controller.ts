import { ProductsService } from '@app/products';
import { Product } from '@app/products/model/product.entity';
import { Body, Controller, Get, Inject, Logger, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { INTEGRATOR_FACTORY } from './integration/constants/integration.tokens';
import { IntegratorFactory } from './integration/integrator/integrator.factory';
import { ProviderKey } from './providers/model/enum/provider-key.enum';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly productsService: ProductsService,
    @Inject(INTEGRATOR_FACTORY)
    private readonly integratorFactory: IntegratorFactory,
  ) {}

  @Get()
  async getProducts(): Promise<Product[]> {
    Logger.debug('Provider Integration controller is getting your products');
    return await this.productsService.findAll();
  }

  @Post()
  async addProduct(@Body() product: Product): Promise<Product> {
    return await this.productsService.create(product);
  }

  @Get('integrate')
  async integrate(): Promise<void> {
    const integrator = this.integratorFactory.getIntegrator(
      ProviderKey.RAINFOREST_API,
    );
    await integrator.getCategoryProductList(null);
  }
}
