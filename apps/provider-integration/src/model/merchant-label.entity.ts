import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GmcLabel } from './gmc-label.entity';
import { Merchant } from './merchant.entity';
import { Product } from './product.entity';

@Entity({ name: 'merchant_label' })
@Index(['merchantId', 'merchantLabelCode'], { unique: true })
export class MerchantLabel {
  constructor(merchantId: string, merchantLabelCode: string) {
    this.merchantId = merchantId;
    this.merchantLabelCode = merchantLabelCode;
  }

  public static factory(
    merchantId: string,
    merchantLabelCode: string,
    data: Partial<MerchantLabel>,
  ) {
    const label = new MerchantLabel(merchantId, merchantLabelCode);
    Object.assign(label, data);
    return label;
  }

  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({ name: 'merchant_id' })
  readonly merchantId: string;

  @Column({ name: 'merchant_label_code' })
  readonly merchantLabelCode: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  logo?: string;

  @Column({ nullable: true })
  url?: string;

  @Column({ name: 'gmc_label_id', nullable: true })
  gmcLabelId?: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @ManyToOne(() => Merchant, (merchant) => merchant.labels)
  @JoinColumn({ name: 'merchant_id' })
  merchant: Merchant;

  @ManyToOne(() => GmcLabel, (group) => group.merchantLabels)
  @JoinColumn({ name: 'gmc_label_id' })
  gmcLabel?: GmcLabel;

  @ManyToMany(() => Product, (product) => product.merchantLabels)
  products: Product[];
}
