import { PageRequest } from '@lib/database/interface/page-request.interface';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
  ): Promise<SourceRun[]> {
    return await this.runRepository.find({
      ...pageRequest,
      where: { ...findDto },
    });
  }

  async findAll(pageRequest?: PageRequest): Promise<SourceRun[]> {
    return await this.runRepository.find({ ...pageRequest });
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
