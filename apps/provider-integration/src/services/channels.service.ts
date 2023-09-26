import { PageRequest } from '@lib/database/interface/page-request.interface';
import { Page } from '@lib/database/interface/page.interface';
import { buildPage } from '@lib/database/utils/build-page';
import { Injectable, Logger } from '@nestjs/common';
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
      .createQueryBuilder('channel')
      .innerJoin('channel.merchant', 'merchant')
      .innerJoin('channel.provider', 'provider')
      .where({
        ...findDto,
      })
      .setFindOptions({
        ...pageRequest,
        relations: {
          merchant: true,
          provider: true,
        },
      })
      .loadRelationCountAndMap('channel.runCount', 'channel.runs')
      .loadRelationCountAndMap('channel.productCount', 'channel.products')
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
    return this.channelsRepo
      .createQueryBuilder('channel')
      .innerJoin('channel.merchant', 'merchant')
      .innerJoin('channel.provider', 'provider')
      .where({
        id,
      })
      .setFindOptions({
        relations: {
          merchant: true,
          provider: true,
        },
      })
      .loadRelationCountAndMap('channel.runCount', 'channel.runs')
      .loadRelationCountAndMap('channel.productCount', 'channel.products')
      .getOne();
  }

  async update(id: string, updates: Partial<Channel>): Promise<Channel> {
    await this.channelsRepo.update(id, updates);
    return this.findOne(id);
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

  canRetry(channel: Channel): boolean {
    return channel.retryLimit == 0 || channel.retryCount < channel.retryLimit;
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

  isDue(channel: Channel): boolean {
    const interval =
      channel.runIntervalHours || channel.provider.runIntervalHours;
    return (
      interval &&
      (!channel.lastRunAt ||
        moment(channel.lastRunAt)
          .add(interval, 'hours')
          .isSameOrBefore(moment()))
    );
  }

  async findAllDue(): Promise<Channel[]> {
    const activeChannels = await this.channelsRepo.find({
      where: {
        active: true,
        provider: {
          active: true,
        },
      },
      relations: {
        provider: true,
      },
    });
    return activeChannels.filter(this.isDue);
  }
}
