import { Provider } from '@app/provider-integration/model/provider.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChannelStatus } from './enum/channel-status';
import { Run } from './run.entity';
import { Merchant } from './merchant.entity';
import { Product } from './product.entity';

@Entity({ name: 'pi_channel' })
export class Channel {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ name: 'provider_id' })
  readonly providerId: string;

  @Column({ name: 'merchant_id' })
  readonly merchantId: string;

  @Column({
    type: 'enum',
    enum: ChannelStatus,
    enumName: 'pi_channel_status_enum',
    default: ChannelStatus.READY,
  })
  status: ChannelStatus;

  /* 
    RUN CONFIGURATION
  */
  @Column({ default: false })
  active: boolean;

  @Column({ name: 'run_interval_hours', type: 'integer', nullable: true })
  runIntervalHours: number;

  @Column({ name: 'expiration_hours', type: 'integer', nullable: true })
  expirationHours: number;

  @Column({ name: 'retry_limit', type: 'integer', default: 4 })
  retryLimit: number;

  @Column({ name: 'retry_count', type: 'integer', default: 0 })
  retryCount: number;

  @Column({ name: 'last_run_at', type: 'timestamptz', nullable: true })
  lastRunAt?: Date;

  /* 
    ETL CONFIG CODES
  */

  @Column({ name: 'ETL_CODE_1', nullable: true })
  etlCode1: string;

  @Column({ name: 'ETL_CODE_2', nullable: true })
  etlCode2: string;

  @Column({ name: 'ETL_CODE_3', nullable: true })
  etlCode3: string;

  @Column({ name: 'ETL_CODE_4', nullable: true })
  etlCode4: string;

  @Column({ name: 'ETL_CODE_5', nullable: true })
  etlCode5: string;

  /* relatie */

  @OneToMany(() => Run, (run: Run) => run.channel)
  runs: Run[];

  @OneToMany(() => Product, (product: Product) => product.channel)
  products: Product[];

  @ManyToOne(() => Merchant, (merchant) => merchant.channels)
  @JoinColumn({ name: 'merchant_id' })
  merchant: Merchant;

  @ManyToOne(() => Provider, (provider: Provider) => provider.channels)
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;
}
