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
import { Merchant } from './merchant.entity';
import { Product } from './product.entity';

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

  @OneToMany(() => Product, (product) => product.merchantBrand)
  products: Product[];

  @ManyToOne(() => Merchant, (merchant) => merchant.brands)
  @JoinColumn({ name: 'merchant_id' })
  merchant: Merchant;
}
