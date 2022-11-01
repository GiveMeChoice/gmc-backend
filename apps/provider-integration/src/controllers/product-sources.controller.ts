import { Controller, Get, Param } from '@nestjs/common';
import { ProductSource } from '../model/product-source.entity';
import { ProductSourcesService } from '../services/product-sources.service';

@Controller('product-sources')
export class ProductSourcesController {
  constructor(private readonly productSourcesService: ProductSourcesService) {}

  @Get()
  async getAll(): Promise<ProductSource[]> {
    return await this.productSourcesService.findAll();
  }

  @Get(':id')
  async getOne(@Param('id') id): Promise<ProductSource> {
    return await this.productSourcesService.findOne(id);
  }
}
