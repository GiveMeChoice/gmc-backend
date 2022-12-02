import { PageRequest } from '@lib/database/interface/page-request.interface';
import { Page } from '@lib/database/interface/page.interface';
import { buildPage } from '@lib/database/utils/build-page';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductRun } from '../model/product-run.entity';

@Injectable()
export class ProductRunsService {
  constructor(
    @InjectRepository(ProductRun)
    private readonly runRepository: Repository<ProductRun>,
  ) {}

  async find(
    findDto: Partial<ProductRun>,
    pageRequest?: PageRequest,
  ): Promise<Page<ProductRun>> {
    const [data, count] = await this.runRepository.findAndCount({
      ...pageRequest,
      where: { ...findDto },
      relations: {
        source: true,
      },
      select: {
        source: {
          providerId: true,
          identifier: true,
          description: true,
        },
      },
    });
    return buildPage<ProductRun>(data, count, pageRequest);
  }

  async findAll(pageRequest?: PageRequest): Promise<Page<ProductRun>> {
    const [data, count] = await this.runRepository.findAndCount({
      ...pageRequest,
    });
    return buildPage<ProductRun>(data, count, pageRequest);
  }

  async findBySource(
    sourceId: string,
    pageRequest?: PageRequest,
  ): Promise<ProductRun[]> {
    return await this.runRepository.find({
      where: {
        source: {
          id: sourceId,
        },
      },
      ...pageRequest,
    });
  }

  async findOne(id: string): Promise<ProductRun> {
    return await this.runRepository.findOneBy({ id });
  }

  async create(run: Partial<ProductRun>): Promise<ProductRun> {
    return await this.runRepository.save(run);
  }

  async save(run: ProductRun): Promise<ProductRun> {
    return await this.runRepository.save(run);
  }
}
