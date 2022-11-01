import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductSource } from '../model/product-source.entity';

@Injectable()
export class ProductSourcesService {
  constructor(
    @InjectRepository(ProductSource)
    private productSourcesRepo: Repository<ProductSource>,
  ) {}

  findAll(): Promise<ProductSource[]> {
    return this.productSourcesRepo.find();
  }

  findOne(id: string): Promise<ProductSource> {
    return this.productSourcesRepo.findOne({
      where: { id },
      relations: {
        provider: true,
      },
    });
  }

  monitorSources() {
    //
  }
}
