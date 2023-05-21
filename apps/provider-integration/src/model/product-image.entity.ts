import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';
import { ProductImageType } from './enum/product-image-type.enum';

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
    enumName: 'product_image_type_enum',
  })
  type?: ProductImageType;

  @ManyToOne(() => Product, (product) => product.images, {
    orphanedRowAction: 'delete',
  })
  product: Product;
}
