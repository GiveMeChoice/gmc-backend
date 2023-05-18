import {
  Entity,
  Tree,
  PrimaryGeneratedColumn,
  Column,
  TreeChildren,
  TreeParent,
  OneToMany,
  Unique,
} from 'typeorm';
import { MerchantCategory } from './merchant-category.entity';

@Entity({ name: 'gmc_category' })
@Tree('nested-set')
@Unique(['name'])
export class Category {
  constructor(name: string) {
    this.name = name;
  }

  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column()
  name: string;

  @TreeChildren()
  children: Category[];

  @TreeParent()
  parent: Category;

  @OneToMany(
    () => MerchantCategory,
    (merchantCategory) => merchantCategory.category,
  )
  merchantCategories: MerchantCategory[];
}
