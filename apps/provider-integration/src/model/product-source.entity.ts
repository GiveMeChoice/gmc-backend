import { Provider } from '@app/provider-integration/model/provider.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ProductSourceStatus } from './enum/product-source-status';
import { Product } from './product.entity';
import { ProductRun } from './product-run.entity';

@Entity({ name: 'pi_product_source' })
@Unique(['providerId', 'identifier'])
export class ProductSource {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({ name: 'provider_id' })
  readonly providerId: string;

  @Column()
  readonly identifier: string;

  @Column({
    type: 'enum',
    enum: ProductSourceStatus,
    enumName: 'pi_product_source_status_enum',
    default: ProductSourceStatus.READY,
  })
  status: ProductSourceStatus;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: false })
  active: boolean;

  @Column({ name: 'run_interval_hours', type: 'integer', default: 24 })
  runIntervalHours: number;

  @Column({ name: 'last_run_at', type: 'timestamptz', nullable: true })
  lastRunAt?: Date;

  @Column({ name: 'owned_count', default: 0 })
  ownedCount: number;

  @Column({ name: 'retry_count', type: 'integer', default: 0 })
  retryCount: number;

  @Column({ name: 'retry_limit', type: 'integer', default: 4 })
  retryLimit: number;

  @Column({ nullable: true })
  category?: string;

  @Column({ name: 'source_link', nullable: true })
  sourceLink?: string;

  @OneToMany(() => ProductRun, (run: ProductRun) => run.source)
  runs: ProductRun[];

  @OneToMany(() => Product, (product: Product) => product.source)
  products: Product[];

  @ManyToOne(() => Provider, (provider: Provider) => provider.sources)
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;
}
