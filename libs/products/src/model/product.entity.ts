import { ProviderKey } from '@app/provider-integration/providers/model/enum/provider-key.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductStatus } from './enum/product-status.enum';

@Entity({ name: 'gmc_product' })
@Index(['providerKey', 'providerId'], { unique: true })
export class Product {
  constructor(providerKey?: ProviderKey, providerId?: string) {
    this.providerKey = providerKey;
    this.providerId = providerId;
  }

  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({
    type: 'enum',
    enum: ProviderKey,
  })
  readonly providerKey: ProviderKey;

  @Column()
  readonly providerId: string;

  @Column({
    type: 'enum',
    enum: ProductStatus,
  })
  status: ProductStatus;

  @Column({ nullable: true })
  sku?: string;

  @Column({ nullable: true })
  title?: string;

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
  description?: string;

  @Column({ nullable: true })
  createdBySourceRunId: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdOn: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedOn: Date;

  public static factory(providerKey?: ProviderKey, providerId?: string) {
    return new Product(providerKey, providerId);
  }
}
