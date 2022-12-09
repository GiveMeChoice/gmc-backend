import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Category } from './category.entity';
import { ProviderKey } from './enum/provider-key.enum';
import { Label } from './label.entity';
import { ProductSource } from './product-source.entity';
import { Product } from './product.entity';

@Entity({ name: 'pi_provider' })
@Unique(['key'])
export class Provider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ProviderKey,
    enumName: 'pi_provider_id_enum',
  })
  key: ProviderKey;

  @Column()
  description: string;

  @Column({ default: false })
  active: boolean;

  @OneToMany(
    () => ProductSource,
    (productSource: ProductSource) => productSource.provider,
  )
  sources: ProductSource[];

  @OneToMany(() => Product, (product) => product.provider)
  products: Product[];

  @OneToMany(() => Label, (label) => label.provider)
  labels: Label[];

  @OneToMany(() => Category, (category) => category.provider)
  categories: Category[];
}
