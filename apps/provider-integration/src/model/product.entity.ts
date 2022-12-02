import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { shortId } from '../utils/short-id';
import { ProductIntegrationStatus } from './enum/product-status.enum';
import { ProductSource } from './product-source.entity';
import { Provider } from './provider.entity';

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
    PRODUCT INFORMATION
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

  @Column({ nullable: true })
  currency?: string;

  @Column({ name: 'brand_id', nullable: true })
  brandId?: string;

  @Column({ name: 'brand_name', nullable: true })
  brandName?: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ nullable: true })
  link?: string;
}
