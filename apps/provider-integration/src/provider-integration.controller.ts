import { ProductsService } from '@app/products';
import { Product } from '@app/products/model/product.entity';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ProviderIntegrationService } from './provider-integration.service';

@Controller()
export class ProviderIntegrationController {
  constructor(
    private readonly providerIntegrationService: ProviderIntegrationService,
    private readonly productsService: ProductsService,
  ) {}

  @Get()
  async getProducts(): Promise<Product[]> {
    return await this.productsService.findAll();
  }

  @Post()
  async addProduct(@Body() product: Product): Promise<Product> {
    return await this.productsService.create(product);
  }
}
