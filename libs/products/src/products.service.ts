import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './model/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productsRepository: Repository<Product>,
  ) {}

  findAll(): Promise<Product[]> {
    Logger.debug('Finding all products');
    return this.productsRepository.find();
  }

  findOne(id: string): Promise<Product> {
    Logger.debug('Finding one product');
    return this.productsRepository.findOneBy({ id });
  }

  async create(product: Product): Promise<Product> {
    Logger.log('Creating a product');
    return await this.productsRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    await this.productsRepository.delete(id);
  }
}
