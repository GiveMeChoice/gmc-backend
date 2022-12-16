import { PageRequest } from '@lib/database/interface/page-request.interface';
import { Page } from '@lib/database/interface/page.interface';
import { buildPage } from '@lib/database/utils/build-page';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindProvidersDto } from '../api/dto/find-providers.dto';
import { ProviderKey } from '../model/enum/provider-key.enum';
import { Provider } from '../model/provider.entity';

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(Provider) private providersRepo: Repository<Provider>,
  ) {}

  async find(
    findDto: FindProvidersDto,
    pageRequest: PageRequest,
  ): Promise<Page<Provider>> {
    const [data, count] = await this.providersRepo
      .createQueryBuilder('provider')
      .where({ ...findDto })
      .setFindOptions({ ...pageRequest })
      .loadRelationCountAndMap('provider.labelCount', 'provider.labels')
      .loadRelationCountAndMap('provider.productCount', 'provider.products')
      .loadRelationCountAndMap('provider.categoryCount', 'provider.categories')
      .loadRelationCountAndMap('provider.sourcesCount', 'provider.sources')
      .getManyAndCount();
    return buildPage<Provider>(data, count, pageRequest);
  }

  async findAll(pageRequest?: PageRequest): Promise<Page<Provider>> {
    const [data, count] = await this.providersRepo.findAndCount({
      ...pageRequest,
    });
    return buildPage<Provider>(data, count, pageRequest);
  }

  findOne(id: string): Promise<Provider> {
    return this.providersRepo.findOneBy({ id });
  }

  findActive(): Promise<Provider[]> {
    return this.providersRepo.find({ where: { active: true } });
  }

  async update(id: string, updates: Partial<Provider>): Promise<Provider> {
    await this.providersRepo.update(id, updates);
    return this.providersRepo.findOne({ where: { id } });
  }
}
