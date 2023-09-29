import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreeRepository } from 'typeorm';
import { GmcLabel } from '../model/gmc-label.entity';
import { CreateGmcLabelDto } from '../api/dto/create-gmc-label.dto';
import { UpdateGmcLabelDto } from '../api/dto/update-gmc-label.dto';

@Injectable()
export class GmcLabelsService {
  private readonly logger = new Logger(GmcLabelsService.name);

  constructor(
    @InjectRepository(GmcLabel)
    private readonly gmcLabelsRepo: TreeRepository<GmcLabel>,
  ) {}

  async findAll(deep: boolean): Promise<GmcLabel[]> {
    return (
      await this.gmcLabelsRepo.findTrees({
        depth: deep ? 10 : 1,
        relations: ['merchantLabels'],
      })
    )[0].children;
  }

  async findOne(id: string, deep: boolean): Promise<GmcLabel> {
    const label = await this.gmcLabelsRepo.findOne({
      where: { id },
      relations: { merchantLabels: true },
    });
    if (!label) {
      throw new NotFoundException();
    }
    return await this.gmcLabelsRepo.findDescendantsTree(label, {
      depth: deep ? 10 : 1,
      relations: ['merchantLabels'],
    });
  }

  async findDescendents(id: string): Promise<GmcLabel[]> {
    const parentLabel = await this.gmcLabelsRepo.findOne({ where: { id } });
    return await this.gmcLabelsRepo.findDescendants(parentLabel, {
      relations: ['merchantLabels'],
    });
  }

  async create(createDto: CreateGmcLabelDto): Promise<GmcLabel> {
    const parent = await this.gmcLabelsRepo.findOne({
      where: { id: createDto.parentId },
    });
    if (!parent) throw new Error('Unable to find parent label');
    const slug = createDto.slug.toLowerCase();

    const label = new GmcLabel(createDto.name, slug);
    label.parent = parent;
    if (createDto.description) {
      label.description = createDto.description;
    }
    return await this.gmcLabelsRepo.save(label);
  }

  async udpate(id: string, updateDto: UpdateGmcLabelDto): Promise<GmcLabel> {
    const label = await this.gmcLabelsRepo.findOne({
      where: { id },
    });
    if (!label) {
      throw new NotFoundException();
    }
    await this.gmcLabelsRepo.save({ id, ...updateDto });
    return await this.gmcLabelsRepo.findOne({
      where: { id },
      relations: { merchantLabels: true, children: true },
    });
  }

  async delete(id: string) {
    const label = await this.gmcLabelsRepo.findOne({
      where: { id },
      relations: { children: true, merchantLabels: true },
    });
    if (!label) {
      throw new NotFoundException();
    }
    if (label.children.length > 0 || label.merchantLabels.length > 0) {
      throw new Error(
        'Cannot delete label with existing child labels or assigned merchant labels',
      );
    }
    this.gmcLabelsRepo.delete({ id });
  }
}
