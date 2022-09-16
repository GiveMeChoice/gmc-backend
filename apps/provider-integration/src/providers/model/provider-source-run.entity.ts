import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProviderSource } from './provider-source.entity';

@Entity({ name: 'pi_provider_source_run' })
export class ProviderSourceRun {
  @PrimaryGeneratedColumn('uuid')
  readonly id!: string;

  @Column({ default: true })
  success: boolean;

  @Column({ default: 0 })
  productsFound: number;

  @Column({ default: 0 })
  productsLoaded: number;

  @Column({ default: 0 })
  errors: number;

  @Column()
  startedAt: Date;

  @Column()
  completedAt: Date;

  @ManyToOne(() => ProviderSource, (source: ProviderSource) => source.runs)
  @JoinColumn({ name: 'sourceId' })
  source: ProviderSource;
}
