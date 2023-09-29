import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';
import { MerchantLabel } from './merchant-label.entity';

@Entity({ name: 'gmc_label' })
@Tree('nested-set')
export class GmcLabel {
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
  description?: string;

  @TreeChildren()
  children: GmcLabel[];

  @TreeParent()
  parent: GmcLabel;

  @OneToMany(() => MerchantLabel, (merchantLabel) => merchantLabel.gmcLabel)
  merchantLabels: MerchantLabel[];
}
