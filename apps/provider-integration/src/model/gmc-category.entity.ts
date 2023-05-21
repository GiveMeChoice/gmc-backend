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
// @Unique(['name'])
export class GmcCategory {
  constructor(name: string) {
    this.name = name;
  }

  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column()
  name: string;

  @TreeChildren()
  children: GmcCategory[];

  @TreeParent()
  parent: GmcCategory;

  @OneToMany(
    () => MerchantCategory,
    (merchantCategory) => merchantCategory.gmcCategory,
  )
  merchantCategories: MerchantCategory[];
}
