import {
  Entity,
  Tree,
  PrimaryGeneratedColumn,
  Column,
  TreeChildren,
  TreeParent,
  OneToMany,
} from 'typeorm';
import { ProviderCategory } from './provider-category.entity';

@Entity({ name: 'gmc_category' })
@Tree('nested-set')
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

  @OneToMany(() => ProviderCategory, (category) => category.category)
  providerCategories: ProviderCategory[];
}
