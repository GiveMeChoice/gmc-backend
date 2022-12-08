import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryGroup } from '../model/category-group.entity';

@Injectable()
export class CategoryGroupsService {
  constructor(
    @InjectRepository(CategoryGroup)
    private readonly categoryGroupsRepo: Repository<CategoryGroup>,
  ) {}

  findAll(): Promise<CategoryGroup[]> {
    return this.categoryGroupsRepo.find();
  }

  findOne(id: string): Promise<CategoryGroup> {
    return this.categoryGroupsRepo.findOne({ where: { id } });
  }

  create(categoryGroup: Partial<CategoryGroup>): Promise<CategoryGroup> {
    return this.categoryGroupsRepo.save(categoryGroup);
  }

  udpate(id: string, updates: Partial<CategoryGroup>): Promise<CategoryGroup> {
    return this.categoryGroupsRepo.save({ id, ...updates });
  }
}
