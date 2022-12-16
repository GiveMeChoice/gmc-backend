import { PageRequest } from '@lib/database/interface/page-request.interface';
import { Page } from '@lib/database/interface/page.interface';
import { buildPage } from '@lib/database/utils/build-page';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Like, Repository } from 'typeorm';
import { ProductSourceStatus } from '../model/enum/product-source-status';
import { ProductRun } from '../model/product-run.entity';
import { ProductSource } from '../model/product-source.entity';
import { ProductRunsService } from './product-runs.service';

@Injectable()
export class ProductSourcesService {
  constructor(
    @InjectRepository(ProductSource)
    private sourcesRepo: Repository<ProductSource>,
    private readonly runsService: ProductRunsService,
  ) {}

  async find(
    findDto: Partial<ProductSource>,
    pageRequest?: PageRequest,
  ): Promise<Page<ProductSource>> {
    const [data, count] = await this.sourcesRepo
      .createQueryBuilder('source')
      .where({
        ...findDto,
        identifier: Like(`%${findDto.identifier ? findDto.identifier : ''}%`),
      })
      .setFindOptions({ ...pageRequest })
      .loadRelationCountAndMap('source.runCount', 'source.runs')
      .loadRelationCountAndMap('source.productCount', 'source.products')
      .getManyAndCount();
    return buildPage<ProductSource>(data, count, pageRequest);
  }

  async findAll(pageRequest?: PageRequest): Promise<Page<ProductSource>> {
    const [data, count] = await this.sourcesRepo.findAndCount({
      ...pageRequest,
    });
    return buildPage<ProductSource>(data, count, pageRequest);
  }

  findOne(id: string): Promise<ProductSource> {
    return this.sourcesRepo.findOne({
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
    await this.sourcesRepo.update(id, updates);
    return this.sourcesRepo.findOne({ where: { id } });
  }

  async startRun(source: ProductSource): Promise<ProductRun> {
    source.status = ProductSourceStatus.BUSY;
    const run = ProductRun.factory(source);
    run.runAt = new Date();
    return await this.runsService.create(run);
  }

  async completeRun(run: ProductRun): Promise<ProductRun> {
    run.runTime = moment().diff(run.runAt, 'seconds', true);
    run.source.lastRunAt = new Date();
    if (run.errorMessage) {
      run.source.retryCount++;
      if (run.source.retryCount >= run.source.retryLimit) {
        run.source.status = ProductSourceStatus.DOWN;
      } else {
        run.source.status = ProductSourceStatus.READY;
      }
    } else {
      run.source.ownedCount =
        run.ownedCount + run.createdCount + run.adoptedCount;
      run.source.status = ProductSourceStatus.READY;
      run.source.retryCount = 0;
    }
    return await this.runsService.save(run);
  }

  async canRetryById(id: string): Promise<boolean> {
    const { retryCount, retryLimit } = await this.sourcesRepo.findOne({
      select: {
        retryCount: true,
        retryLimit: true,
      },
      where: { id },
    });
    return retryLimit == 0 || retryCount < retryLimit;
  }

  canRetry(source: ProductSource): boolean {
    return source.retryLimit == 0 || source.retryCount < source.retryLimit;
  }

  async isDueById(id: string): Promise<boolean> {
    return this.isDue(
      await this.sourcesRepo.findOne({
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

  isDue(source: ProductSource): boolean {
    return (
      source.runIntervalHours &&
      (!source.lastRunAt ||
        moment(source.lastRunAt)
          .add(source.runIntervalHours, 'hours')
          .isSameOrBefore(moment()))
    );
  }

  async findAllDue(): Promise<ProductSource[]> {
    return (
      await this.sourcesRepo.find({
        where: {
          active: true,
          provider: {
            active: true,
          },
        },
      })
    ).filter(this.isDue);
  }
}
