import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
  Unique,
} from 'typeorm';
import { MerchantLabel } from './merchant-label.entity';

@Entity({ name: 'gmc_label' })
@Tree('nested-set')
// @Unique(['name'])
export class GmcLabel {
  constructor(name: string) {
    this.name = name;
  }

  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column()
  readonly name: string;

  @Column({ nullable: true })
  description?: string;

  @TreeChildren()
  children: GmcLabel[];

  @TreeParent()
  parent: GmcLabel;

  @OneToMany(() => MerchantLabel, (merchantLabel) => merchantLabel.gmcLabel)
  merchantLabels: MerchantLabel[];
}
