import { ProductsService } from '@app/products';
import { Product } from '@app/products/model/product.entity';
import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly productsService: ProductsService,
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
}
