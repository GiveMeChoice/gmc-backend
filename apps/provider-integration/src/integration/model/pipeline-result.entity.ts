import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'pi_pipeline_result' })
export class PipelineResult {
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
}
