import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PipelineResult } from '../model/pipeline-result.entity';

@Injectable()
export class PipelineResultsService {
  constructor(
    @InjectRepository(PipelineResult)
    private resultsRepo: Repository<PipelineResult>,
  ) {}

  findAll(): Promise<PipelineResult[]> {
    return this.resultsRepo.find();
  }

  findOne(id: string): Promise<PipelineResult> {
    return this.resultsRepo.findOneBy({ id });
  }

  async create(product: Partial<PipelineResult>): Promise<PipelineResult> {
    return await this.resultsRepo.save(product);
  }

  async remove(id: string): Promise<void> {
    await this.resultsRepo.delete(id);
  }
}
