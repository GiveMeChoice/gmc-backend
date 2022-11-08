import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { nanoid } from 'nanoid';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { ProductIntegrationStatus } from './enum/product-status.enum';

@Entity({ name: 'gmc_product' })
@Index(['providerKey', 'providerProductId'], { unique: true })
@Unique(['shortId'])
export class Product {
  constructor(providerKey?: ProviderKey, providerProductId?: string) {
    this.providerKey = providerKey;
    this.providerProductId = providerProductId;
    this.shortId = nanoid(11);
  }
  public static factory(providerKey?: ProviderKey, providerId?: string) {
    return new Product(providerKey, providerId);
  }
  /* 
  ///////////////////////
    HEADER DATA
  ///////////////////////
  */
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({ name: 'provider_key' })
  readonly providerKey: string;

  @Column({ name: 'provider_product_id' })
  readonly providerProductId: string;

  @Column({ name: 'short_id' })
  readonly shortId: string;

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
  sourceId: string;

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
