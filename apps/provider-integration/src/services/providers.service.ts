import { PageRequest } from '@lib/database/interface/page-request.interface';
import { Page } from '@lib/database/interface/page.interface';
import { buildPage } from '@lib/database/utils/build-page';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindProvidersDto } from '../api/dto/find-providers.dto';
import { ProviderKey } from '../model/enum/provider-key.enum';
import { ProviderSource } from '../model/provider-source.entity';
import { Provider } from '../model/provider.entity';

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(Provider) private providersRepo: Repository<Provider>,
    @InjectRepository(ProviderSource)
    private sourcesRepo: Repository<ProviderSource>,
  ) {}

  async find(
    findDto: FindProvidersDto,
    pageRequest: PageRequest,
  ): Promise<Page<Provider>> {
    const [data, count] = await this.providersRepo
      .createQueryBuilder('provider')
      .where({ ...findDto })
      .setFindOptions({ ...pageRequest })
      .loadRelationCountAndMap('provider.sourcesCount', 'provider.sources')
      .getManyAndCount();

    for (const provider of data) {
      (provider as any).productCount = 0;
      const data = await this.sourcesRepo
        .createQueryBuilder('source')
        .where({ providerId: provider.id })
        .loadRelationCountAndMap('source.productCount', 'source.products')
        .getMany();
      for (const source of data) {
        (provider as any).productCount += (source as any).productCount;
      }
    }
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

  findOneByKey(key: ProviderKey): Promise<Provider> {
    if (!key) return null;
    return this.providersRepo.findOneBy({ key });
  }

  findActive(): Promise<Provider[]> {
    return this.providersRepo.find({ where: { active: true } });
  }

  async update(id: string, updates: Partial<Provider>): Promise<Provider> {
    await this.providersRepo.update(id, updates);
    return this.providersRepo.findOne({ where: { id } });
  }
}
