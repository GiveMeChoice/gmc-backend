import { PageRequest } from '@lib/database/interface/page-request.interface';
import { Page } from '@lib/database/interface/page.interface';
import { buildPage } from '@lib/database/utils/build-page';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Like, Repository } from 'typeorm';
import { ProductSourceStatus } from '../model/enum/product-source-status';
import { ProductSource } from '../model/product-source.entity';
import { SourceRun } from '../model/source-run.entity';
import { SourceRunsService } from './source-runs.service';

@Injectable()
export class ProductSourcesService {
  constructor(
    @InjectRepository(ProductSource)
    private productSourcesRepo: Repository<ProductSource>,
    private readonly runService: SourceRunsService,
  ) {}

  async find(
    findDto: Partial<ProductSource>,
    pageRequest?: PageRequest,
  ): Promise<Page<ProductSource>> {
    const [data, count] = await this.productSourcesRepo.findAndCount({
      ...pageRequest,
      where: {
        ...findDto,
        identifier: Like(`%${findDto.identifier ? findDto.identifier : ''}%`),
      },
    });
    return buildPage<ProductSource>(data, count, pageRequest);
  }

  async findAll(pageRequest?: PageRequest): Promise<Page<ProductSource>> {
    const [data, count] = await this.productSourcesRepo.findAndCount({
      ...pageRequest,
    });
    return buildPage<ProductSource>(data, count, pageRequest);
  }

  findOne(id: string): Promise<ProductSource> {
    return this.productSourcesRepo.findOne({
      where: { id },
      relations: {
        provider: true,
      },
    });
  }

  async update(
    id: string,
    updates: Partial<ProductSource>,
  ): Promise<ProductSource> {
    await this.productSourcesRepo.update(id, updates);
    return this.productSourcesRepo.findOne({ where: { id } });
  }

  async startRun(source: ProductSource): Promise<SourceRun> {
    source.status = ProductSourceStatus.BUSY;
    const run = SourceRun.factory(source);
    run.startedAt = new Date();
    return await this.runService.create(run);
  }

  async completeRun(run: SourceRun): Promise<SourceRun> {
    run.completedAt = new Date();
    run.source.lastRunAt = new Date();
    if (run.errorMessage) {
      run.source.status = ProductSourceStatus.DOWN;
      run.source.retryCount++;
    } else {
      run.source.status = ProductSourceStatus.READY;
      run.source.retryCount = 0;
    }
    return await this.runService.save(run);
  }

  async canRetry(id: string): Promise<boolean> {
    const { retryCount, retryLimit } = await this.productSourcesRepo.findOne({
      select: {
        retryCount: true,
        retryLimit: true,
      },
      where: { id },
    });
    return retryLimit == 0 || retryCount < retryLimit;
  }

  async isDue(id: string): Promise<any> {
    return this.isIntegrationIntervalPassed(
      await this.productSourcesRepo.findOne({
        where: {
          id,
          active: true,
          provider: {
            active: true,
          },
        },
      }),
    );
  }

  async findAllDue(): Promise<ProductSource[]> {
    return (
      await this.productSourcesRepo.find({
        where: {
          active: true,
          provider: {
            active: true,
          },
        },
      })
    ).filter(this.isIntegrationIntervalPassed);
  }

  private isIntegrationIntervalPassed(source: ProductSource): boolean {
    return (
      source.runIntervalHours &&
      (!source.lastRunAt ||
        moment(source.lastRunAt)
          .add(source.runIntervalHours, 'hours')
          .isSameOrBefore(moment()))
    );
  }
}
