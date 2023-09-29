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
import { Channel } from './channel.entity';
import { ProductReview } from './product-review.entity';
import { ProductImage } from './product-image.entity';

@Entity({ name: 'product' })
@Index(['merchantId', 'merchantProductCode'], { unique: true })
@Unique(['shortId'])
export class Product {
  constructor(
    merchantProductCode: string,
    merchantId: string,
    channelId: string,
  ) {
    this.merchantProductCode = merchantProductCode;
    this.merchantId = merchantId;
    this.channelId = channelId;
  }
  public static factory(data: Partial<Product>, channel: Channel) {
    const product = new Product(
      data.merchantProductCode,
      channel.merchantId,
      channel.id,
    );
    product.shortId = shortId();
    Object.assign(product, data);
    product.channel = channel;
    product.merchant = channel.merchant;
    return product;
  }

  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({ name: 'short_id' })
  shortId: string;

  @Column({ name: 'merchant_id' })
  readonly merchantId: string;

  @Column({ name: 'merchant_product_code' })
  readonly merchantProductCode: string;

  @Column({ name: 'channel_id' })
  readonly channelId: string;

  @Column({ name: 'merchant_brand_id', nullable: true })
  merchantBrandId?: string;

  @Column({ name: 'merchant_category_id', nullable: true })
  merchantCategoryId?: string;

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

  /* 
    INTEGRATION METADATA
  */
  @Column({
    name: 'product_status',
    type: 'enum',
    enum: ProductStatus,
    enumName: 'product_status_enum',
  })
  status: ProductStatus;

  @Column({ name: 'created_by_run_id' })
  createdByRunId: string;

  @Column({ name: 'refreshed_by_run_id', nullable: true })
  refreshedByRunId: string;

  @Column({ name: 'refreshed_at', type: 'timestamptz', nullable: true })
  refreshedAt: Date;

  @Column({ name: 'indexed_at', type: 'timestamptz', nullable: true })
  indexedAt: Date;

  @Column({
    name: 'product_refresh_reason',
    type: 'enum',
    enum: ProductRefreshReason,
    enumName: 'product_refresh_reason_enum',
    nullable: true,
  })
  refreshReason: ProductRefreshReason;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date;

  @Column({ name: 'keep_alive_count', type: 'integer', default: 0 })
  keepAliveCount: number;

  @Column({ name: 'error_message', nullable: true })
  errorMessage: string;

  /* 
    PRODUCT DATA
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

  @Column({ name: 'offer_url', nullable: true })
  offerUrl?: string;

  /* 
    
  RELATIONS  
  */

  @ManyToOne(() => Channel, (channel: Channel) => channel.products)
  @JoinColumn({ name: 'channel_id' })
  channel: Channel;

  @ManyToOne(() => Merchant, (merchant: Merchant) => merchant.products)
  @JoinColumn({ name: 'merchant_id' })
  merchant: Merchant;

  @ManyToOne(() => MerchantBrand, (brand) => brand.products, {
    cascade: true,
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'merchant_brand_id' })
  merchantBrand?: MerchantBrand;

  @ManyToOne(() => MerchantCategory, (category) => category.products, {
    cascade: true,
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'merchant_category_id' })
  merchantCategory?: MerchantCategory;

  @ManyToMany(() => MerchantLabel, (label) => label.products, {
    cascade: true,
    onUpdate: 'CASCADE',
  })
  @JoinTable({
    name: 'product_merchant_label',
    joinColumn: {
      name: 'product',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'merchant_label',
      referencedColumnName: 'id',
    },
  })
  merchantLabels: MerchantLabel[];

  @OneToMany(() => ProductReview, (reviews) => reviews.product, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  reviews?: ProductReview[];

  @OneToMany(() => ProductImage, (images) => images.product, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  images?: ProductImage[];
}
