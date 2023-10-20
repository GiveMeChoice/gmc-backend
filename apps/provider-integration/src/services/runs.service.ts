import { PageRequest } from '@lib/database/interface/page-request.interface';
import { Page } from '@lib/database/interface/page.interface';
import { buildPage } from '@lib/database/utils/build-page';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Repository } from 'typeorm';
import { Channel } from '../model/channel.entity';
import { ChannelStatus } from '../model/enum/channel-status';
import { Run } from '../model/run.entity';

@Injectable()
export class RunsService {
  private readonly logger = new Logger(RunsService.name);

  constructor(
    @InjectRepository(Run)
    private readonly runRepository: Repository<Run>,
  ) {}

  async start(channel: Channel): Promise<Run> {
    // validate channel before starting
    if (!channel) {
      throw new HttpException('Invalid Product Source', HttpStatus.BAD_REQUEST);
    } else if (!channel.active || !channel.provider.active) {
      throw new Error(
        'Provider and/or Channel is not active! Skipping integration...',
      );
    }
    // else if (source.status === ProductSourceStatus.BUSY) {
    // throw new Error('Source is BUSY. Can not integrate again until ready.');
    // }
    // set source to BUSY and create new source run
    channel.status = ChannelStatus.BUSY;
    const run = Run.factory(channel);
    run.runAt = new Date();
    return await this.create(run);
  }

  async complete(run: Run): Promise<Run> {
    run.runTime = moment().diff(run.runAt, 'seconds', true);
    run.channel.lastRunAt = new Date();
    if (run.errorMessage) {
      run.channel.retryCount++;
      if (run.channel.retryCount >= run.channel.retryLimit) {
        run.channel.status = ChannelStatus.DOWN;
      } else {
        run.channel.status = ChannelStatus.READY;
      }
    } else {
      // run.channel.ownedCount =
      //   run.ownedCount + run.createdCount + run.adoptedCount;
      run.channel.status = ChannelStatus.READY;
      run.channel.retryCount = 0;
    }
    return await this.save(run);
  }

  async find(
    findDto: Partial<Run>,
    pageRequest?: PageRequest,
  ): Promise<Page<Run>> {
    const [data, count] = await this.runRepository.findAndCount({
      ...pageRequest,
      where: { ...findDto },
      relations: {
        channel: {
          merchant: true,
          provider: true,
        },
      },
    });
    return buildPage<Run>(data, count, pageRequest);
  }

  async findAll(pageRequest?: PageRequest): Promise<Page<Run>> {
    const [data, count] = await this.runRepository.findAndCount({
      ...pageRequest,
    });
    return buildPage<Run>(data, count, pageRequest);
  }

  async findBySource(
    sourceId: string,
    pageRequest?: PageRequest,
  ): Promise<Run[]> {
    return await this.runRepository.find({
      where: {
        channel: {
          id: sourceId,
        },
      },
      ...pageRequest,
    });
  }

  async findOne(id: string): Promise<Run> {
    return await this.runRepository.findOne({
      where: { id },
      relations: { channel: { provider: true, merchant: true } },
    });
  }

  async create(run: Partial<Run>): Promise<Run> {
    this.logger.debug(`Creating run: ${JSON.stringify(run)}`);
    const { id } = await this.runRepository.save(run);
    return await this.findOne(id);
  }

  async save(run: Run): Promise<Run> {
    return await this.runRepository.save(run);
  }
}
