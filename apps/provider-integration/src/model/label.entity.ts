import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LabelGroup } from './label-group.entity';
import { Product } from './product.entity';

@Entity({ name: 'gmc_label' })
@Index(['providerId', 'title'], { unique: true })
export class Label {
  constructor(providerId: string, title: string) {
    this.providerId = providerId;
    this.title = title;
  }

  public static factory(
    providerId: string,
    title: string,
    data: Partial<Label>,
  ) {
    const label = new Label(providerId, title);
    Object.assign(label, data);
    return label;
  }

  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({ name: 'provider_id' })
  readonly providerId: string;

  @Column()
  readonly title: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Column({ name: 'info_link', nullable: true })
  infoLink?: string;

  @Column({ nullable: true })
  icon?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ name: 'group_id', nullable: true })
  groupId?: string;

  @ManyToOne(() => LabelGroup, (group) => group.labels)
  @JoinColumn({ name: 'group_id' })
  group?: LabelGroup;

  @ManyToMany(() => Product, (product) => product.labels)
  products: Product[];
}
