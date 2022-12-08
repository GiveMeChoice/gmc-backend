import { PageRequest } from '@lib/database/interface/page-request.interface';
import { Page } from '@lib/database/interface/page.interface';
import { buildPage } from '@lib/database/utils/build-page';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from '../model/brand.entity';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand) private readonly brandsRepo: Repository<Brand>,
  ) {}

  async findAll(pageRequest?: PageRequest): Promise<Page<Brand>> {
    const [data, count] = await this.brandsRepo.findAndCount({
      ...pageRequest,
    });
    return buildPage<Brand>(data, count, pageRequest);
  }

  findOne(id: string): Promise<Brand> {
    return this.brandsRepo.findOne({
      where: { id },
    });
  }

  async find(
    findDto: Partial<Brand>,
    pageRequest?: PageRequest,
  ): Promise<Page<Brand>> {
    const [data, count] = await this.brandsRepo.findAndCount({
      ...pageRequest,
      where: {
        ...findDto,
      },
    });
    return buildPage<Brand>(data, count, pageRequest);
  }

  findOneByProvider(providerId: string, title: string) {
    return this.brandsRepo.findOne({
      where: { providerId, title },
    });
  }

  create(brand: Partial<Brand>): Promise<Brand> {
    return this.brandsRepo.save(brand);
  }

  async update(id: string, brand: Partial<Brand>): Promise<Brand> {
    await this.brandsRepo.save({ id, ...brand });
    return await this.findOne(id);
  }
}
