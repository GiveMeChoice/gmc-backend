import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
  Unique,
} from 'typeorm';
import { MerchantCategory } from './merchant-category.entity';

@Entity({ name: 'gmc_category' })
@Tree('nested-set')
// @Unique(['slug'])
export class GmcCategory {
  constructor(name: string, slug: string) {
    this.name = name;
    this.slug = slug;
  }

  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column()
  slug: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  color?: string;

  @Column({ nullable: true })
  description?: string;

  @TreeChildren()
  children: GmcCategory[];

  @TreeParent()
  parent: GmcCategory;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @OneToMany(
    () => MerchantCategory,
    (merchantCategory) => merchantCategory.gmcCategory,
  )
  merchantCategories: MerchantCategory[];
}
