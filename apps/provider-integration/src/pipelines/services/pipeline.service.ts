import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pipeline } from '../model/pipeline.entity';

@Injectable()
export class PipelineService {
  constructor(
    @InjectRepository(Pipeline) private pipelineRepo: Repository<Pipeline>,
  ) {}

  findOne(id: string): Promise<Pipeline> {
    return this.pipelineRepo.findOne({
      where: { id },
      relations: {
        provider: true,
      },
    });
  }
}
