import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Repository } from 'typeorm';
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

  async update(
    id: string,
    updates: Partial<ProductSource>,
  ): Promise<ProductSource> {
    return (
      await this.productSourcesRepo
        .createQueryBuilder()
        .update({
          ...updates,
        })
        .where({ id })
        .returning('*')
        .execute()
    ).raw[0];
  }

  async startRun(source: ProductSource): Promise<SourceRun> {
    source.status = ProductSourceStatus.BUSY;
    const run = SourceRun.factory(source);
    run.startedAt = new Date();
    return await this.runService.create(run);
  }

  async completeRun(run: SourceRun): Promise<SourceRun> {
    run.completedAt = new Date();
    run.source.lastRunDate = new Date();
    run.source.status = run.errorMessage
      ? ProductSourceStatus.DOWN
      : ProductSourceStatus.READY;
    return await this.runService.save(run);
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
      (!source.lastRunDate ||
        moment(source.lastRunDate)
          .add(source.runIntervalHours, 'hours')
          .isSameOrBefore(moment()))
    );
  }
}
