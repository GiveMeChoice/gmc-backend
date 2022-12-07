import { PageRequest } from '@lib/database/interface/page-request.interface';
import { Page } from '@lib/database/interface/page.interface';
import { buildPage } from '@lib/database/utils/build-page';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    return this.labelsRepo.findOne({ where: { id } });
  }

  findOneByProvider(providerId: string, title: string) {
    return this.labelsRepo.findOne({
      where: { providerId, title },
    });
  }

  create(label: Partial<Label>): Promise<Label> {
    return this.labelsRepo.save(label);
  }
}
