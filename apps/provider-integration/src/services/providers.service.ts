import { PageRequest } from '@lib/database/interface/page-request.interface';
import { Page } from '@lib/database/interface/page.interface';
import { buildPage } from '@lib/database/utils/build-page';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindProvidersDto } from '../api/dto/find-providers.dto';
import { ProviderKey } from '../model/enum/provider-key.enum';
import { Channel } from '../model/channel.entity';
import { Provider } from '../model/provider.entity';

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(Provider) private providersRepo: Repository<Provider>,
    @InjectRepository(Channel)
    private channelRepo: Repository<Channel>,
  ) {}

  async find(
    findDto: FindProvidersDto,
    pageRequest: PageRequest,
  ): Promise<Page<Provider>> {
    const [data, count] = await this.providersRepo
      .createQueryBuilder('provider')
      .where({ ...findDto })
      .setFindOptions({ ...pageRequest })
      .loadRelationCountAndMap('provider.channelCount', 'provider.channels')
      .getManyAndCount();
    // add provider product count (sum of channel product counts)
    for (const provider of data) {
      (provider as any).productCount = await this.calculateProviderProductCount(
        provider.id,
      );
    }
    return buildPage<Provider>(data, count, pageRequest);
  }

  private async calculateProviderProductCount(
    providerId: string,
  ): Promise<number> {
    let productCount = 0;
    const data = await this.channelRepo
      .createQueryBuilder('channel')
      .where({ providerId })
      .loadRelationCountAndMap('channel.productCount', 'channel.products')
      .getMany();
    for (const channel of data) {
      productCount += (channel as any).productCount;
    }
    return productCount;
  }

  async findAll(pageRequest?: PageRequest): Promise<Page<Provider>> {
    const [data, count] = await this.providersRepo.findAndCount({
      ...pageRequest,
    });
    return buildPage<Provider>(data, count, pageRequest);
  }

  async findOne(id: string): Promise<Provider> {
    const provider = await this.providersRepo
      .createQueryBuilder('provider')
      .where({ id })
      .loadRelationCountAndMap('provider.channelCount', 'provider.channels')
      .getOne();
    (provider as any).productCount = await this.calculateProviderProductCount(
      provider.id,
    );
    return provider;
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
    return this.findOne(id);
  }
}
