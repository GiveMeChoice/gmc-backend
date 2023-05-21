import { PageRequest } from '@lib/database/interface/page-request.interface';
import { Page } from '@lib/database/interface/page.interface';
import { buildPage } from '@lib/database/utils/build-page';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Repository } from 'typeorm';
import { Channel } from '../model/channel.entity';
import { ChannelStatus } from '../model/enum/channel-status';
import { Run } from '../model/run.entity';
import { RunsService } from './runs.service';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channel)
    private channelsRepo: Repository<Channel>,
    private readonly runsService: RunsService,
  ) {}

  async find(
    findDto: Partial<Channel>,
    pageRequest?: PageRequest,
  ): Promise<Page<Channel>> {
    const [data, count] = await this.channelsRepo
      .createQueryBuilder('source')
      .where({
        ...findDto,
        // identifier: Like(`%${findDto.identifier ? findDto.identifier : ''}%`),
      })
      .setFindOptions({ ...pageRequest })
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

  // async startRun(channel: Channel): Promise<Run> {
  //   // validate channel before starting
  //   if (!channel) {
  //     throw new HttpException('Invalid Product Source', HttpStatus.BAD_REQUEST);
  //   } else if (!channel.active || !channel.provider.active) {
  //     throw new Error(
  //       'Provider and/or Source is not active! Skipping integration...',
  //     );
  //   }
  //   // else if (source.status === ProductSourceStatus.BUSY) {
  //   // throw new Error('Source is BUSY. Can not integrate again until ready.');
  //   // }

  //   // set source to BUSY and create new source run
  //   channel.status = ChannelStatus.BUSY;
  //   const run = Run.factory(channel);
  //   run.runAt = new Date();
  //   return await this.runsService.create(run);
  // }

  // async completeRun(run: Run): Promise<Run> {
  //   run.runTime = moment().diff(run.runAt, 'seconds', true);
  //   run.channel.lastRunAt = new Date();
  //   if (run.errorMessage) {
  //     run.channel.retryCount++;
  //     if (run.channel.retryCount >= run.channel.retryLimit) {
  //       run.channel.status = ChannelStatus.DOWN;
  //     } else {
  //       run.channel.status = ChannelStatus.READY;
  //     }
  //   } else {
  //     // run.channel.ownedCount =
  //     //   run.ownedCount + run.createdCount + run.adoptedCount;
  //     run.channel.status = ChannelStatus.READY;
  //     run.channel.retryCount = 0;
  //   }
  //   return await this.runsService.save(run);
  // }

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
