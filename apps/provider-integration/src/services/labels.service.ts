import { PageRequest } from '@lib/database/interface/page-request.interface';
import { Page } from '@lib/database/interface/page.interface';
import { buildPage } from '@lib/database/utils/build-page';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Label } from '../model/label.entity';

@Injectable()
export class LabelsService {
  constructor(
    @InjectRepository(Label) private readonly labelsRepo: Repository<Label>,
  ) {}

  async findAll(pageRequest?: PageRequest): Promise<Page<Label>> {
    const [data, count] = await this.labelsRepo.findAndCount({
      ...pageRequest,
    });
    return buildPage<Label>(data, count, pageRequest);
  }

  findOne(id: string): Promise<Label> {
    return this.labelsRepo.findOne({
      where: { id },
      relations: { group: true },
    });
  }

  async find(
    findDto: Partial<Label>,
    pageRequest?: PageRequest,
  ): Promise<Page<Label>> {
    const [data, count] = await this.labelsRepo
      .createQueryBuilder('label')
      .where({
        ...findDto,
      })
      .setFindOptions({
        ...pageRequest,
        relations: {
          group: true,
        },
        select: {
          group: {
            name: true,
          },
        },
      })
      .loadRelationCountAndMap('label.productCount', 'label.products')
      .getManyAndCount();
    return buildPage<Label>(data, count, pageRequest);
  }

  findOneByProvider(providerId: string, title: string) {
    return this.labelsRepo.findOne({
      where: { providerId, code: title },
    });
  }

  create(label: Partial<Label>): Promise<Label> {
    return this.labelsRepo.save(label);
  }

  async update(id: string, label: Partial<Label>): Promise<Label> {
    await this.labelsRepo.save({ id, ...label });
    return await this.findOne(id);
  }
}
