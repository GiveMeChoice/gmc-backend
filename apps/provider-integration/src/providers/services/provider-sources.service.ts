import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProviderSource } from '../model/provider-source.entity';

@Injectable()
export class ProviderSourcesService {
  constructor(
    @InjectRepository(ProviderSource)
    private productSourcesRepo: Repository<ProviderSource>,
  ) {}

  findOne(id: string): Promise<ProviderSource> {
    return this.productSourcesRepo.findOne({
      where: { id },
      relations: {
        provider: true,
      },
    });
  }
}
