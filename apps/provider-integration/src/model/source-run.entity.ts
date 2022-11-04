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
  constructor(source: ProductSource) {
    // this.id = v4();
    // this.completed = true;
    // this.productsFound = 0;
    // this.productsCreated = 0;
    this.source = source;
  }

  @PrimaryGeneratedColumn('uuid')
  readonly id!: string;

  @ManyToOne(() => ProductSource, (source: ProductSource) => source.runs, {
    cascade: true,
  })
  @JoinColumn({ name: 'sourceId' })
  source: ProductSource;

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

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  errorMessage?: string;

  public static factory(source: ProductSource) {
    return new SourceRun(source);
  }
}
