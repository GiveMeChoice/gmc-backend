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
import { ProductStatus } from './enum/product-status.enum';

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

  @Column()
  readonly providerKey: string;

  @Column()
  readonly providerProductId: string;

  @Column()
  readonly shortId: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  /* 
  ///////////////////////
    INTEGRATION METADATA
  ///////////////////////
  */
  @Column({
    type: 'enum',
    enum: ProductStatus,
    enumName: 'gmc_product_status_enum',
  })
  status: ProductStatus;

  @Column({ type: 'timestamptz' })
  statusAt: Date;
  @Column()
  productSourceId: string;

  @Column({ type: 'timestamptz' })
  lastRefreshedAt: Date;

  @Column()
  lastRefreshedBy: string;

  @Column({ type: 'timestamptz' })
  lastFoundAt: Date;

  @Column()
  lastFoundBy: string;

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

  @Column({ nullable: true })
  ratingsTotal?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price?: number;

  @Column({ nullable: true })
  currency?: string;

  @Column({ nullable: true })
  brandId?: string;

  @Column({ nullable: true })
  brandName?: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ nullable: true })
  link?: string;

  @Column({ nullable: true })
  createdBySourceRunId: string;
}
