import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { v4 } from 'uuid';
import { ProductSource } from './product-source.entity';

@Entity({ name: 'pi_source_run' })
export class SourceRun {
  constructor() {
    this.id = v4();
    this.completed = true;
    this.productsFound = 0;
    this.productsCreated = 0;
  }
  @PrimaryGeneratedColumn('uuid')
  readonly id!: string;

  @ManyToOne(() => ProductSource, (source: ProductSource) => source.runs)
  @JoinColumn({ name: 'sourceId' })
  source: ProductSource;

  @Column({ default: true })
  completed: boolean;

  @Column({ nullable: true })
  errorMessage?: string;

  @Column({ default: 0 })
  productsFound: number;

  @Column({ default: 0 })
  productsCreated: number;

  @Column({ default: 0 })
  productsRefreshed: number;

  @Column({ default: 0 })
  productFailures: number;

  @Column()
  startedAt: Date;

  @Column()
  completedAt: Date;

  public static factory() {
    return new SourceRun();
  }
}
