import { PageRequest } from '@lib/database/interface/page-request.interface';
import { Page } from '@lib/database/interface/page.interface';
import { buildPage } from '@lib/database/utils/build-page';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Run } from '../model/run.entity';

@Injectable()
export class RunsService {
  private readonly logger = new Logger(RunsService.name);

  constructor(
    @InjectRepository(Run)
    private readonly runRepository: Repository<Run>,
  ) {}

  async find(
    findDto: Partial<Run>,
    pageRequest?: PageRequest,
  ): Promise<Page<Run>> {
    const [data, count] = await this.runRepository.findAndCount({
      ...pageRequest,
      where: { ...findDto },
      relations: {
        channel: true,
      },
      select: {
        channel: {
          providerId: true,
          id: true,
          description: true,
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
