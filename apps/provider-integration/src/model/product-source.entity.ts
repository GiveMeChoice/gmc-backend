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

  @Column()
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

  @Column({ type: 'integer', default: 0 })
  runIntervalHours: number;

  @Column({ nullable: true })
  lastRunDate: Date;

  @Column()
  category: string;

  @Column()
  subcategory1: string;

  @Column()
  subcategory2: string;

  @OneToMany(() => SourceRun, (run: SourceRun) => run.source)
  runs: SourceRun[];

  @ManyToOne(() => Provider, (provider: Provider) => provider.sources)
  @JoinColumn({ name: 'providerId' })
  provider: Provider;
}
