import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreeRepository } from 'typeorm';
import { GmcLabel } from '../model/gmc-label.entity';

@Injectable()
export class GmcLabelsService {
  private readonly logger = new Logger(GmcLabelsService.name);

  constructor(
    @InjectRepository(GmcLabel)
    private readonly gmcLabelsRepo: TreeRepository<GmcLabel>,
  ) {}

  async findAll(tree?: boolean): Promise<GmcLabel | GmcLabel[]> {
    return tree
      ? (await this.gmcLabelsRepo.findTrees())[0]
      : this.gmcLabelsRepo.find();
  }

  findOne(id: string): Promise<GmcLabel> {
    return this.gmcLabelsRepo.findOne({
      where: { id },
      relations: { merchantLabels: true },
    });
  }

  async findAncestors(
    id: string,
    tree?: boolean,
  ): Promise<GmcLabel | GmcLabel[]> {
    const childLabelGroup = await this.gmcLabelsRepo.findOne({
      where: { id },
    });
    return tree
      ? await this.gmcLabelsRepo.findAncestorsTree(childLabelGroup)
      : await this.gmcLabelsRepo.findAncestors(childLabelGroup);
  }

  async findDescendents(
    id: string,
    tree?: boolean,
  ): Promise<GmcLabel | GmcLabel[]> {
    const parentLabelGroup = await this.gmcLabelsRepo.findOne({
      where: { id },
    });
    return tree
      ? await this.gmcLabelsRepo.findDescendantsTree(parentLabelGroup)
      : await this.gmcLabelsRepo.findDescendants(parentLabelGroup);
  }

  create(group: Partial<GmcLabel>): Promise<GmcLabel> {
    return this.gmcLabelsRepo.save(group);
  }

  udpate(id: string, updates: Partial<GmcLabel>): Promise<GmcLabel> {
    return this.gmcLabelsRepo.save({ id, ...updates });
  }
}
