import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { Product } from './model/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productsRepository: Repository<Product>,
  ) {}

  findAll(): Promise<Product[]> {
    return this.productsRepository.find();
  }

  findByProviderId(
    providerId: string,
    providerProductId: string,
  ): Promise<Product> {
    return this.productsRepository.findOneBy({
      providerId,
      providerProductId,
    });
  }

  findOne(id: string): Promise<Product> {
    return this.productsRepository.findOneBy({ id });
  }

  async create(product: Partial<Product>): Promise<Product> {
    return await this.productsRepository.save(product);
  }

  async update(id: string, updates: Partial<Product>): Promise<UpdateResult> {
    return await this.productsRepository.update(id, updates);
  }

  async remove(id: string): Promise<void> {
    await this.productsRepository.delete(id);
  }
}
