import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProviderSourceRun } from '../model/provider-source-run.entity';

@Injectable()
export class ProviderSourceRunsService {
  constructor(
    @InjectRepository(ProviderSourceRun)
    private readonly runRepository: Repository<ProviderSourceRun>,
  ) {}

  async findOne(id: string): Promise<ProviderSourceRun> {
    return await this.runRepository.findOneBy({ id });
  }

  async create(run: Partial<ProviderSourceRun>): Promise<ProviderSourceRun> {
    return await this.runRepository.save(run);
  }
}
