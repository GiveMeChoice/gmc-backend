import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from '../model/provider.entity';

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(Provider) private providersRepo: Repository<Provider>,
  ) {}

  findAll(): Promise<Provider[]> {
    return this.providersRepo.find();
  }

  findOne(id: string): Promise<Provider> {
    return this.providersRepo.findOneBy({ id });
  }

  getCategories(id: string): Promise<Provider> {
    return this.providersRepo.findOne({
      where: { id },
      relations: {
        pipelines: true,
      },
    });
  }
}
