import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreeRepository } from 'typeorm';
import { LabelGroup } from '../model/label-group.entity';

@Injectable()
export class LabelGroupsService {
  private readonly logger = new Logger(LabelGroupsService.name);

  constructor(
    @InjectRepository(LabelGroup)
    private readonly labelGroupsRepo: TreeRepository<LabelGroup>,
  ) {}

  async findAll(tree?: boolean): Promise<LabelGroup | LabelGroup[]> {
    return tree
      ? (await this.labelGroupsRepo.findTrees())[0]
      : this.labelGroupsRepo.find();
  }

  findOne(id: string): Promise<LabelGroup> {
    return this.labelGroupsRepo.findOne({
      where: { id },
      relations: { merchantLabels: true },
    });
  }

  async findAncestors(
    id: string,
    tree?: boolean,
  ): Promise<LabelGroup | LabelGroup[]> {
    const childLabelGroup = await this.labelGroupsRepo.findOne({
      where: { id },
    });
    return tree
      ? await this.labelGroupsRepo.findAncestorsTree(childLabelGroup)
      : await this.labelGroupsRepo.findAncestors(childLabelGroup);
  }

  async findDescendents(
    id: string,
    tree?: boolean,
  ): Promise<LabelGroup | LabelGroup[]> {
    const parentLabelGroup = await this.labelGroupsRepo.findOne({
      where: { id },
    });
    return tree
      ? await this.labelGroupsRepo.findDescendantsTree(parentLabelGroup)
      : await this.labelGroupsRepo.findDescendants(parentLabelGroup);
  }

  create(group: Partial<LabelGroup>): Promise<LabelGroup> {
    return this.labelGroupsRepo.save(group);
  }

  udpate(id: string, updates: Partial<LabelGroup>): Promise<LabelGroup> {
    return this.labelGroupsRepo.save({ id, ...updates });
  }
}
