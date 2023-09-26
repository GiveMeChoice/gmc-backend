import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Merchant } from './merchant.entity';
import { Product } from './product.entity';
import { GmcBrand } from './gmc-brand.entity';

@Entity({ name: 'merchant_brand' })
@Index(['merchantId', 'merchantBrandCode'], { unique: true })
export class MerchantBrand {
  constructor(merchantId: string, merchantBrandCode: string) {
    this.merchantId = merchantId;
    this.merchantBrandCode = merchantBrandCode;
  }

  public static factory(
    merchantId: string,
    merchantBrandCode: string,
    data: Partial<MerchantBrand>,
  ) {
    const brand = new MerchantBrand(merchantId, merchantBrandCode);
    Object.assign(brand, data);
    return brand;
  }

  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({ name: 'merchant_id' })
  readonly merchantId: string;

  @Column({ name: 'merchant_brand_code ' })
  readonly merchantBrandCode: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  logo?: string;

  @Column({ nullable: true })
  url?: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({ name: 'gmc_brand_id', nullable: true })
  gmcBrandId?: string;

  @ManyToOne(() => Merchant, (merchant) => merchant.brands)
  @JoinColumn({ name: 'merchant_id' })
  merchant: Merchant;

  @OneToOne(() => GmcBrand, (brand) => brand.merchantBrand)
  @JoinColumn({ name: 'gmc_brand_id' })
  gmcBrand?: GmcBrand;

  @OneToMany(() => Product, (product) => product.merchantBrand)
  products: Product[];
}
