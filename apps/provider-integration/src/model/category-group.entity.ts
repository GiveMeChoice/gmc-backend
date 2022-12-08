import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Category } from './category.entity';

@Entity({ name: 'gmc_category_group' })
@Unique(['name'])
export class CategoryGroup {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column()
  readonly name: string;

  @OneToMany(() => Category, (category) => category.group)
  categories: Category[];
}
