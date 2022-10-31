import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProviderKey } from '../model/enum/provider-key.enum';
import { Provider } from '../model/provider.entity';

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(Provider) private providersRepo: Repository<Provider>,
  ) {}

  findAll(): Promise<Provider[]> {
    return this.providersRepo.find();
  }

  findOne(id: ProviderKey): Promise<Provider> {
    return this.providersRepo.findOneBy({ id });
  }

  getCategories(id: ProviderKey): Promise<Provider> {
    return this.providersRepo.findOne({
      where: { id },
      relations: {
        sources: true,
      },
    });
  }
}
