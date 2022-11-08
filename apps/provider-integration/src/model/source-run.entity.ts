import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductSource } from './product-source.entity';

@Entity({ name: 'pi_source_run' })
export class SourceRun {
  constructor(source: ProductSource) {
    this.source = source;
  }

  @PrimaryGeneratedColumn('uuid')
  readonly id!: string;

  @ManyToOne(() => ProductSource, (source: ProductSource) => source.runs, {
    cascade: true,
  })
  @JoinColumn({ name: 'source_id' })
  source: ProductSource;

  @Column({ name: 'found_count', default: 0 })
  foundCount: number;

  @Column({ name: 'owned_count', default: 0 })
  ownedCount: number;

  @Column({ name: 'created_count', default: 0 })
  createdCount: number;

  @Column({ name: 'adopted_count', default: 0 })
  adoptedCount: number;

  @Column({ name: 'stale_count', default: 0 })
  staleCount: number;

  @Column({ name: 'keep_alive_signal_count', default: 0 })
  keepAliveSignalCount: number;

  @Column({ name: 'refresh_signal_count', default: 0 })
  refreshSignalCount: number;

  @Column({ name: 'failure_count', default: 0 })
  failureCount: number;

  @Column({ name: 'started_at', type: 'timestamptz' })
  startedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date;

  @Column({ name: 'error_message', nullable: true })
  errorMessage?: string;

  public static factory(source: ProductSource) {
    return new SourceRun(source);
  }
}
