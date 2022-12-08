import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity({ name: 'gmc_review' })
export class Review {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column()
  author?: string;

  @Column()
  text?: string;

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    nullable: true,
  })
  rating?: number;

  @Column({ name: 'submitted_on', type: 'timestamptz' })
  submittedOn?: Date;

  @ManyToOne(() => Product, (product) => product.reviews, {
    orphanedRowAction: 'delete',
  })
  product: Product;
}
