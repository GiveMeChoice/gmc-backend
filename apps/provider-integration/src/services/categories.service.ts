import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../model/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  findAll(): Promise<Category[]> {
    return this.categoryRepo.find();
  }

  findOne(id: string): Promise<Category> {
    return this.categoryRepo.findOne({ where: { id } });
  }

  create(category: Partial<Category>): Promise<Category> {
    return this.categoryRepo.save(category);
  }

  udpate(id: string, updates: Partial<Category>): Promise<Category> {
    return this.categoryRepo.save({ id, ...updates });
  }
}
