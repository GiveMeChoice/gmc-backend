import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity({ name: 'product_review' })
export class ProductReview {
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
