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
import { Brand } from './brand.entity';
import { Category } from './category.entity';
import { ProductRefreshReason } from './enum/product-refresh-reason.enum';
import { ProductIntegrationStatus } from './enum/product-status.enum';
import { Label } from './label.entity';
import { ProductSource } from './product-source.entity';
import { Provider } from './provider.entity';
import { Review } from './review.entity';

@Entity({ name: 'gmc_product' })
@Index(['providerId', 'providerProductId'], { unique: true })
@Unique(['shortId'])
export class Product {
  constructor(providerId: string, providerProductId: string) {
    this.providerId = providerId;
    this.providerProductId = providerProductId;
  }
  public static factory(
    providerId: string,
    providerProductId: string,
    data: Partial<Product>,
  ) {
    const product = new Product(providerId, providerProductId);
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

  @Column({ name: 'provider_id' })
  readonly providerId: string;

  @Column({ name: 'provider_product_id' })
  readonly providerProductId: string;

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

  @ManyToOne(() => Provider, (provider: Provider) => provider.products)
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  /* 
  ///////////////////////
    INTEGRATION METADATA
  ///////////////////////
  */
  @Column({
    name: 'integration_status',
    type: 'enum',
    enum: ProductIntegrationStatus,
    enumName: 'gmc_product_integration_status_enum',
  })
  integrationStatus: ProductIntegrationStatus;

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

  @ManyToOne(() => ProductSource, (source: ProductSource) => source.products)
  @JoinColumn({ name: 'source_id' })
  source: ProductSource;

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

  @ManyToOne(() => Brand, (brand) => brand.products, {
    cascade: true,
    onUpdate: 'CASCADE',
  })
  brand?: Brand;

  @ManyToOne(() => Category, (category) => category.products, {
    cascade: true,
    onUpdate: 'CASCADE',
  })
  category?: Category;

  @Column({ name: 'category_detail', nullable: true })
  categoryDetail?: string;

  @OneToMany(() => Review, (reviews) => reviews.product, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  reviews?: Review[];

  @ManyToMany(() => Label, (label) => label.products, {
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
  labels: Label[];
}
