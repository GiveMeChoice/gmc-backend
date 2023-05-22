import { PageRequest } from '@lib/database/interface/page-request.interface';
import { Page } from '@lib/database/interface/page.interface';
import { buildPage } from '@lib/database/utils/build-page';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Repository } from 'typeorm';
import { Channel } from '../model/channel.entity';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channel)
    private channelsRepo: Repository<Channel>,
  ) {}

  async find(
    findDto: Partial<Channel>,
    pageRequest?: PageRequest,
  ): Promise<Page<Channel>> {
    const [data, count] = await this.channelsRepo
      .createQueryBuilder('source')
      .innerJoin('source.merchant', 'merchant')
      .innerJoin('source.provider', 'provider')
      .where({
        ...findDto,
      })
      .setFindOptions({
        ...pageRequest,
      })
      .loadRelationCountAndMap('source.runCount', 'source.runs')
      .loadRelationCountAndMap('source.productCount', 'source.products')
      .getManyAndCount();
    return buildPage<Channel>(data, count, pageRequest);
  }

  async findAll(pageRequest?: PageRequest): Promise<Page<Channel>> {
    const [data, count] = await this.channelsRepo.findAndCount({
      ...pageRequest,
    });
    return buildPage<Channel>(data, count, pageRequest);
  }

  findOne(id: string): Promise<Channel> {
    return this.channelsRepo.findOne({
      where: { id },
      relations: {
        provider: true,
      },
    });
  }

  async update(id: string, updates: Partial<Channel>): Promise<Channel> {
    await this.channelsRepo.update(id, updates);
    return this.channelsRepo.findOne({ where: { id } });
  }

  async canRetryById(id: string): Promise<boolean> {
    const { retryCount, retryLimit } = await this.channelsRepo.findOne({
      select: {
        retryCount: true,
        retryLimit: true,
      },
      where: { id },
    });
    return retryLimit == 0 || retryCount < retryLimit;
  }

  canRetry(source: Channel): boolean {
    return source.retryLimit == 0 || source.retryCount < source.retryLimit;
  }

  async isDueById(id: string): Promise<boolean> {
    return this.isDue(
      await this.channelsRepo.findOne({
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

  isDue(source: Channel): boolean {
    return (
      source.runIntervalHours &&
      (!source.lastRunAt ||
        moment(source.lastRunAt)
          .add(source.runIntervalHours, 'hours')
          .isSameOrBefore(moment()))
    );
  }

  async findAllDue(): Promise<Channel[]> {
    return (
      await this.channelsRepo.find({
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
