import { PageRequest } from '@lib/database/interface/page-request.interface';
import { Page } from '@lib/database/interface/page.interface';
import { buildPage } from '@lib/database/utils/build-page';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProviderSourceRun } from '../model/provider-source-run.entity';

@Injectable()
export class ProviderSourceRunsService {
  private readonly logger = new Logger(ProviderSourceRunsService.name);

  constructor(
    @InjectRepository(ProviderSourceRun)
    private readonly runRepository: Repository<ProviderSourceRun>,
  ) {}

  async find(
    findDto: Partial<ProviderSourceRun>,
    pageRequest?: PageRequest,
  ): Promise<Page<ProviderSourceRun>> {
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
    return buildPage<ProviderSourceRun>(data, count, pageRequest);
  }

  async findAll(pageRequest?: PageRequest): Promise<Page<ProviderSourceRun>> {
    const [data, count] = await this.runRepository.findAndCount({
      ...pageRequest,
    });
    return buildPage<ProviderSourceRun>(data, count, pageRequest);
  }

  async findBySource(
    sourceId: string,
    pageRequest?: PageRequest,
  ): Promise<ProviderSourceRun[]> {
    return await this.runRepository.find({
      where: {
        source: {
          id: sourceId,
        },
      },
      ...pageRequest,
    });
  }

  async findOne(id: string): Promise<ProviderSourceRun> {
    return await this.runRepository.findOne({
      where: { id },
      relations: { source: { provider: { merchant: true } } },
    });
  }

  async create(run: Partial<ProviderSourceRun>): Promise<ProviderSourceRun> {
    this.logger.debug(`Creating run: ${JSON.stringify(run)}`);
    const { id } = await this.runRepository.save(run);
    return await this.findOne(id);
  }

  async save(run: ProviderSourceRun): Promise<ProviderSourceRun> {
    return await this.runRepository.save(run);
  }
}
