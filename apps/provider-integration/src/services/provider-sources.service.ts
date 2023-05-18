import { PageRequest } from '@lib/database/interface/page-request.interface';
import { Page } from '@lib/database/interface/page.interface';
import { buildPage } from '@lib/database/utils/build-page';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Like, Repository } from 'typeorm';
import { ProviderSourceStatus } from '../model/enum/provider-source-status';
import { ProviderSourceRun } from '../model/provider-source-run.entity';
import { ProviderSource } from '../model/provider-source.entity';
import { ProviderSourceRunsService } from './provider-source-runs.service';

@Injectable()
export class ProviderSourcesService {
  constructor(
    @InjectRepository(ProviderSource)
    private sourcesRepo: Repository<ProviderSource>,
    private readonly runsService: ProviderSourceRunsService,
  ) {}

  async find(
    findDto: Partial<ProviderSource>,
    pageRequest?: PageRequest,
  ): Promise<Page<ProviderSource>> {
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
    return buildPage<ProviderSource>(data, count, pageRequest);
  }

  async findAll(pageRequest?: PageRequest): Promise<Page<ProviderSource>> {
    const [data, count] = await this.sourcesRepo.findAndCount({
      ...pageRequest,
    });
    return buildPage<ProviderSource>(data, count, pageRequest);
  }

  findOne(id: string): Promise<ProviderSource> {
    return this.sourcesRepo.findOne({
      where: { id },
      relations: {
        provider: true,
      },
    });
  }

  async update(
    id: string,
    updates: Partial<ProviderSource>,
  ): Promise<ProviderSource> {
    await this.sourcesRepo.update(id, updates);
    return this.sourcesRepo.findOne({ where: { id } });
  }

  async startRun(source: ProviderSource): Promise<ProviderSourceRun> {
    // validate source before starting
    if (!source) {
      throw new HttpException('Invalid Product Source', HttpStatus.BAD_REQUEST);
    } else if (!source.active || !source.provider.active) {
      throw new Error(
        'Provider and/or Source is not active! Skipping integration...',
      );
    }
    // else if (source.status === ProductSourceStatus.BUSY) {
    // throw new Error('Source is BUSY. Can not integrate again until ready.');
    // }

    // set source to BUSY and create new source run
    source.status = ProviderSourceStatus.BUSY;
    const run = ProviderSourceRun.factory(source);
    run.runAt = new Date();
    return await this.runsService.create(run);
  }

  async completeRun(run: ProviderSourceRun): Promise<ProviderSourceRun> {
    run.runTime = moment().diff(run.runAt, 'seconds', true);
    run.source.lastRunAt = new Date();
    if (run.errorMessage) {
      run.source.retryCount++;
      if (run.source.retryCount >= run.source.retryLimit) {
        run.source.status = ProviderSourceStatus.DOWN;
      } else {
        run.source.status = ProviderSourceStatus.READY;
      }
    } else {
      run.source.ownedCount =
        run.ownedCount + run.createdCount + run.adoptedCount;
      run.source.status = ProviderSourceStatus.READY;
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

  canRetry(source: ProviderSource): boolean {
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

  isDue(source: ProviderSource): boolean {
    return (
      source.runIntervalHours &&
      (!source.lastRunAt ||
        moment(source.lastRunAt)
          .add(source.runIntervalHours, 'hours')
          .isSameOrBefore(moment()))
    );
  }

  async findAllDue(): Promise<ProviderSource[]> {
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
