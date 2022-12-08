import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CategoryGroup } from './category-group.entity';
import { Product } from './product.entity';

@Entity({ name: 'gmc_category' })
@Index(['providerId', 'title'], { unique: true })
export class Category {
  constructor(providerId: string, title: string) {
    this.providerId = providerId;
    this.title = title;
  }

  public static factory(
    providerId: string,
    title: string,
    data: Partial<Category>,
  ) {
    const category = new Category(providerId, title);
    Object.assign(category, data);
    return category;
  }

  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({ name: 'provider_id' })
  readonly providerId: string;

  @Column()
  readonly title: string;

  @Column({ name: 'info_link', nullable: true })
  infoLink?: string;

  @Column({ nullable: true })
  description?: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({ name: 'group_id', nullable: true })
  groupId?: string;

  @ManyToOne(() => CategoryGroup, (group) => group.categories)
  @JoinColumn({ name: 'group_id' })
  group?: CategoryGroup;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
