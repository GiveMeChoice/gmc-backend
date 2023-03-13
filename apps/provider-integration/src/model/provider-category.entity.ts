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
import { Category } from './category.entity';
import { Product } from './product.entity';
import { Provider } from './provider.entity';

@Entity({ name: 'gmc_provider_category' })
@Index(['providerId', 'code'], { unique: true })
export class ProviderCategory {
  constructor(providerId: string, title: string) {
    this.providerId = providerId;
    this.code = title;
  }

  public static factory(
    providerId: string,
    title: string,
    data: Partial<ProviderCategory>,
  ) {
    const providerCategory = new ProviderCategory(providerId, title);
    Object.assign(providerCategory, data);
    return providerCategory;
  }

  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({ name: 'provider_id' })
  readonly providerId: string;

  @Column()
  readonly code: string;

  @Column()
  description: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({ name: 'category_id', nullable: true })
  categoryId?: string;

  @ManyToOne(() => Provider, (provider) => provider.categories)
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @ManyToOne(() => Category, (category) => category.providerCategories)
  @JoinColumn({ name: 'category_id' })
  category?: Category;

  @OneToMany(() => Product, (product) => product.providerCategory)
  products: Product[];
}
