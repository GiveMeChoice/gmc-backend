import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { v4 } from 'uuid';
import { ProviderSource } from './provider-source.entity';

@Entity({ name: 'pi_provider_source_run' })
export class ProviderSourceRun {
  constructor() {
    this.id = v4();
    this.success = true;
    this.productsFound = 0;
    this.productsCreated = 0;
  }
  @PrimaryGeneratedColumn('uuid')
  readonly id!: string;

  @Column({ default: true })
  success: boolean;

  @Column({ default: 0 })
  productsFound: number;

  @Column({ default: 0 })
  productsCreated: number;

  @Column({ nullable: true })
  error?: string;

  @Column()
  startedAt: Date;

  @Column()
  completedAt: Date;

  @ManyToOne(() => ProviderSource, (source: ProviderSource) => source.runs)
  @JoinColumn({ name: 'sourceId' })
  source: ProviderSource;

  public static factory() {
    return new ProviderSourceRun();
  }
}
