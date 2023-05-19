import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Channel } from './channel.entity';

@Entity({ name: 'pi_run' })
export class Run {
  constructor(channel: Channel) {
    this.channel = channel;
  }

  @PrimaryGeneratedColumn('uuid')
  readonly id!: string;

  @Column({ name: 'channel_id' })
  readonly channelId: string;

  @ManyToOne(() => Channel, (channel: Channel) => channel.runs, {
    cascade: true,
  })
  @JoinColumn({ name: 'channel_id' })
  channel: Channel;

  @Column({ name: 'found_count', default: 0 })
  foundCount: number;

  @Column({ name: 'owned_count', default: 0 })
  ownedCount: number;

  @Column({ name: 'created_count', default: 0 })
  createdCount: number;

  @Column({ name: 'adopted_count', default: 0 })
  adoptedCount: number;

  @Column({ name: 'foreign_count', default: 0 })
  foreignCount: number;

  @Column({ name: 'pending_count', default: 0 })
  pendingCount: number;

  @Column({ name: 'stale_count', default: 0 })
  staleCount: number;

  @Column({ name: 'keep_alive_signal_count', default: 0 })
  keepAliveSignalCount: number;

  @Column({ name: 'refresh_signal_count', default: 0 })
  refreshSignalCount: number;

  @Column({ name: 'failure_count', default: 0 })
  failureCount: number;

  @Column({ name: 'run_at', type: 'timestamptz' })
  runAt: Date;

  @Column({ name: 'content_date', type: 'timestamptz', nullable: true })
  contentDate: Date;

  @Column({
    name: 'run_time',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  runTime: number;

  @Column({ name: 'error_message', nullable: true })
  errorMessage?: string;

  public static factory(source: Channel) {
    return new Run(source);
  }
}
