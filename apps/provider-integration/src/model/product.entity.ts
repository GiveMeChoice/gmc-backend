import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { shortId } from '../utils/short-id';
import { MerchantBrand } from './merchant-brand.entity';
import { ProductStatus } from './enum/product-status.enum';
import { ProductRefreshReason } from './enum/product-refresh-reason.enum';
import { MerchantCategory } from './merchant-category.entity';
import { MerchantLabel } from './merchant-label.entity';
import { Merchant } from './merchant.entity';
import { ProviderSource } from './provider-source.entity';
import { ProductReview } from './product-review.entity';

@Entity({ name: 'gmc_product' })
@Index(['merchantId', 'merchantProductId'], { unique: true })
@Unique(['shortId'])
export class Product {
  constructor(merchantId: string, merchantProductId: string) {
    this.merchantId = merchantId;
    this.merchantProductId = merchantProductId;
  }
  public static factory(data: Partial<Product>) {
    const product = new Product(data.merchant.id, data.merchantProductId);
    product.shortId = shortId();
    Object.assign(product, data);
    return product;
  }
  /* 
  ///////////////////////
    HEADER DATA
  ///////////////////////
  */
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({ name: 'merchant_id' })
  readonly merchantId: string;

  @Column({ name: 'merchant_product_id' })
  readonly merchantProductId: string;

  @Column({ name: 'short_id' })
  shortId: string;

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

  @ManyToOne(() => Merchant, (merchant: Merchant) => merchant.products)
  @JoinColumn({ name: 'merchant_id' })
  merchant: Merchant;

  /* 
  ///////////////////////
    INTEGRATION METADATA
  ///////////////////////
  */
  @Column({
    name: 'integration_status',
    type: 'enum',
    enum: ProductStatus,
    enumName: 'gmc_product_integration_status_enum',
  })
  integrationStatus: ProductStatus;

  @Column({ name: 'source_id' })
  readonly sourceId: string;

  @Column({ name: 'created_by_run_id' })
  createdByRunId: string;

  @Column({ name: 'refreshed_by_run_id', nullable: true })
  refreshedByRunId: string;

  @Column({ name: 'refreshed_at', type: 'timestamptz', nullable: true })
  refreshedAt: Date;

  @Column({
    name: 'refresh_reason',
    type: 'enum',
    enum: ProductRefreshReason,
    enumName: 'gmc_product_refresh_reason_enum',
    nullable: true,
  })
  refreshReason: ProductRefreshReason;

  @Column({ name: 'source_date', type: 'timestamptz', nullable: true })
  sourceDate: Date;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date;

  @Column({ name: 'keep_alive_count', type: 'integer', default: 0 })
  keepAliveCount: number;

  @Column({ name: 'has_integration_error', default: false })
  hasIntegrationError: boolean;

  @Column({ name: 'error_message', nullable: true })
  errorMessage: string;

  @ManyToOne(() => ProviderSource, (source: ProviderSource) => source.products)
  @JoinColumn({ name: 'source_id' })
  source: ProviderSource;

  /* 
  ///////////////////////
    PRODUCT DATA
  ///////////////////////
  */
  @Column({ nullable: true })
  sku?: string;

  @Column({ nullable: true })
  title?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    nullable: true,
  })
  rating?: number;

  @Column({ name: 'ratings_total', nullable: true })
  ratingsTotal?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price?: number;

  @Column({
    name: 'shipping_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  shippingPrice?: number;

  @Column({ nullable: true })
  currency?: string;

  @Column({ name: 'list_image', nullable: true })
  listImage?: string;

  @Column({ name: 'main_image', nullable: true })
  mainImage?: string;

  @Column({ name: 'secondary_image', nullable: true })
  secondaryImage?: string;

  @Column({ name: 'offer_link', nullable: true })
  offerLink?: string;

  @ManyToOne(() => MerchantBrand, (brand) => brand.products, {
    cascade: true,
    onUpdate: 'CASCADE',
  })
  merchantBrand?: MerchantBrand;

  @ManyToOne(() => MerchantCategory, (category) => category.products, {
    cascade: true,
    onUpdate: 'CASCADE',
  })
  merchantCategory?: MerchantCategory;

  @OneToMany(() => ProductReview, (reviews) => reviews.product, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  reviews?: ProductReview[];

  @ManyToMany(() => MerchantLabel, (label) => label.products, {
    cascade: true,
    onUpdate: 'CASCADE',
  })
  @JoinTable({
    name: 'gmc_product_label',
    joinColumn: {
      name: 'product',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'label',
      referencedColumnName: 'id',
    },
  })
  merchantLabels: MerchantLabel[];
}
