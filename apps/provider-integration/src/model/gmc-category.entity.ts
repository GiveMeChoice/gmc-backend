import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';
import { MerchantCategory } from './merchant-category.entity';

@Entity({ name: 'gmc_category' })
@Tree('nested-set')
export class GmcCategory {
  constructor(name: string, slug: string) {
    this.name = name;
    this.slug = slug;
    // this.shortId = shortId();
  }

  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  // @Column({ name: 'short_id' })
  // shortId: string;

  @Column()
  slug: string;

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
