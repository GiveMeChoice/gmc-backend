import { PageRequest } from '@lib/database/interface/page-request.interface';
import { Page } from '@lib/database/interface/page.interface';
import { buildPage } from '@lib/database/utils/build-page';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { FindSourcesDto } from '../api/dto/find-sources.dto';
import { SourceRun } from '../model/source-run.entity';

@Injectable()
export class SourceRunsService {
  constructor(
    @InjectRepository(SourceRun)
    private readonly runRepository: Repository<SourceRun>,
  ) {}

  async find(
    findDto: FindSourcesDto,
    pageRequest?: PageRequest,
  ): Promise<Page<SourceRun>> {
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
    return buildPage<SourceRun>(data, count, pageRequest);
  }

  async findAll(pageRequest?: PageRequest): Promise<Page<SourceRun>> {
    const [data, count] = await this.runRepository.findAndCount({
      ...pageRequest,
    });
    return buildPage<SourceRun>(data, count, pageRequest);
  }

  async findBySource(
    sourceId: string,
    pageRequest?: PageRequest,
  ): Promise<SourceRun[]> {
    return await this.runRepository.find({
      where: {
        source: {
          id: sourceId,
        },
      },
      ...pageRequest,
    });
  }

  async findOne(id: string): Promise<SourceRun> {
    return await this.runRepository.findOneBy({ id });
  }

  async create(run: Partial<SourceRun>): Promise<SourceRun> {
    return await this.runRepository.save(run);
  }

  async save(run: SourceRun): Promise<SourceRun> {
    return await this.runRepository.save(run);
  }
}
