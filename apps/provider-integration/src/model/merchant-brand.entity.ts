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

@Entity({ name: 'gmc_merchant_brand' })
@Index(['merchantId', 'code'], { unique: true })
export class MerchantBrand {
  constructor(merchantId: string, name: string) {
    this.merchantId = merchantId;
    this.code = name;
  }

  public static factory(
    merchantId: string,
    name: string,
    data: Partial<MerchantBrand>,
  ) {
    const brand = new MerchantBrand(merchantId, name);
    Object.assign(brand, data);
    return brand;
  }

  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({ name: 'merchant_id' })
  readonly merchantId: string;

  @Column()
  readonly code: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ name: 'logo_url', nullable: true })
  logoUrl?: string;

  @Column({ name: 'info_link', nullable: true })
  infoLink?: string;

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
