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
import { GmcCategory } from './gmc-category.entity';
import { Merchant } from './merchant.entity';
import { Product } from './product.entity';

@Entity({ name: 'merchant_category' })
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
  name: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({ name: 'gmc_category_id', nullable: true })
  gmcCategoryId?: string;

  @ManyToOne(() => Merchant, (merchant) => merchant.categories)
  @JoinColumn({ name: 'merchant_id' })
  merchant: Merchant;

  @ManyToOne(() => GmcCategory, (gmcCategory) => gmcCategory.merchantCategories)
  @JoinColumn({ name: 'gmc_category_id' })
  gmcCategory?: GmcCategory;

  @OneToMany(() => Product, (product) => product.merchantCategory)
  products: Product[];
}
