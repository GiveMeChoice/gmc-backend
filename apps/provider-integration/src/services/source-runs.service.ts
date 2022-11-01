import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SourceRun } from '../model/source-run.entity';

@Injectable()
export class SourceRunsService {
  constructor(
    @InjectRepository(SourceRun)
    private readonly runRepository: Repository<SourceRun>,
  ) {}

  async findOne(id: string): Promise<SourceRun> {
    return await this.runRepository.findOneBy({ id });
  }

  async create(run: Partial<SourceRun>): Promise<SourceRun> {
    return await this.runRepository.save(run);
  }
}
