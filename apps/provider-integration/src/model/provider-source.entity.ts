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
import { ProviderSourceStatus } from './enum/provider-source-status';
import { Product } from './product.entity';
import { ProviderSourceRun } from './provider-source-run.entity';

@Entity({ name: 'pi_provider_source' })
@Unique(['providerId', 'identifier'])
export class ProviderSource {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({ name: 'provider_id' })
  readonly providerId: string;

  @Column()
  readonly identifier: string;

  @Column({
    type: 'enum',
    enum: ProviderSourceStatus,
    enumName: 'pi_product_source_status_enum',
    default: ProviderSourceStatus.READY,
  })
  status: ProviderSourceStatus;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: false })
  active: boolean;

  @Column({ name: 'run_interval_hours', type: 'integer', nullable: true })
  runIntervalHours: number;

  @Column({ name: 'expiration_hours', type: 'integer', nullable: true })
  expirationHours: number;

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

  @OneToMany(() => ProviderSourceRun, (run: ProviderSourceRun) => run.source)
  runs: ProviderSourceRun[];

  @OneToMany(() => Product, (product: Product) => product.source)
  products: Product[];

  @ManyToOne(() => Provider, (provider: Provider) => provider.sources)
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;
}
