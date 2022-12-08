import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LabelGroup } from '../model/label-group.entity';

@Injectable()
export class LabelGroupsService {
  constructor(
    @InjectRepository(LabelGroup)
    private readonly labelGroupsRepo: Repository<LabelGroup>,
  ) {}

  findAll(): Promise<LabelGroup[]> {
    return this.labelGroupsRepo.find();
  }

  findOne(id: string): Promise<LabelGroup> {
    return this.labelGroupsRepo.findOne({ where: { id } });
  }

  create(labelGroup: Partial<LabelGroup>): Promise<LabelGroup> {
    return this.labelGroupsRepo.save(labelGroup);
  }

  udpate(id: string, updates: Partial<LabelGroup>): Promise<LabelGroup> {
    return this.labelGroupsRepo.save({ id, ...updates });
  }
}
