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

@Entity({ name: 'gmc_label_group' })
@Tree('nested-set')
@Unique(['name'])
export class LabelGroup {
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
  children: LabelGroup[];

  @TreeParent()
  parent: LabelGroup;

  @OneToMany(() => MerchantLabel, (merchantLabel) => merchantLabel.group)
  merchantLabels: MerchantLabel[];
}
