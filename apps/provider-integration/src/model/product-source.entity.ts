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
import { SourceRun } from './source-run.entity';

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

  @Column()
  description: string;

  @Column({ default: false })
  active: boolean;

  @Column({ name: 'run_interval_hours', type: 'integer', default: 0 })
  runIntervalHours: number;

  @Column({ name: 'last_run_at', type: 'timestamptz', nullable: true })
  lastRunAt: Date;

  @Column({ name: 'retry_count', type: 'integer', default: 0 })
  retryCount: number;

  @Column({ name: 'retry_limit', type: 'integer', default: 5 })
  retryLimit: number;

  /* 
    Will trigger auto-hard product refresh after set number of keep alive signals.
    Use with caution...
  */
  @Column({ name: 'product_keep_alive_limit', type: 'integer', nullable: true })
  productKeepAliveLimit: number;

  @Column()
  category: string;

  @Column({ name: 'subcategory_1' })
  subcategory1: string;

  @Column({ name: 'subcategory_2' })
  subcategory2: string;

  @OneToMany(() => SourceRun, (run: SourceRun) => run.source)
  runs: SourceRun[];

  @ManyToOne(() => Provider, (provider: Provider) => provider.sources)
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;
}
