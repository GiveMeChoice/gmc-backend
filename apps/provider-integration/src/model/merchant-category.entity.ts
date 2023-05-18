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
import { Merchant } from './merchant.entity';
import { Product } from './product.entity';

@Entity({ name: 'gmc_merchant_category' })
@Index(['merchantId', 'code'], { unique: true })
export class MerchantCategory {
  constructor(merchantId: string, code: string) {
    this.merchantId = merchantId;
    this.code = code;
  }

  public static factory(
    merchantId: string,
    title: string,
    data: Partial<MerchantCategory>,
  ) {
    const merchantCategory = new MerchantCategory(merchantId, title);
    Object.assign(merchantCategory, data);
    return merchantCategory;
  }

  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({ name: 'merchant_id' })
  readonly merchantId: string;

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

  @ManyToOne(() => Merchant, (merchant) => merchant.categories)
  @JoinColumn({ name: 'merchant_id' })
  merchant: Merchant;

  @ManyToOne(() => Category, (category) => category.merchantCategories)
  @JoinColumn({ name: 'category_id' })
  category?: Category;

  @OneToMany(() => Product, (product) => product.merchantCategory)
  products: Product[];
}
