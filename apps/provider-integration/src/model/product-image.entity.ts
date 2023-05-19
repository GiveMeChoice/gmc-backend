import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity({ name: 'product_image' })
export class ProductImage {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column()
  url: string;

  @Column()
  primary?: boolean;

  @Column({
    type: 'enum',
    enum: ProductImageType,
    enumName: 'product_image_type__enum',
  })
  type?: ProductImageType;

  @ManyToOne(() => Product, (product) => product.images, {
    orphanedRowAction: 'delete',
  })
  product: Product;
}
