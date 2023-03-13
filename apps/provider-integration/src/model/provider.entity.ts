import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ProviderCategory } from './provider-category.entity';
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

  @Column({ name: 'run_interval_hours', type: 'integer', default: 24 })
  runIntervalHours: number;

  @Column({ name: 'expiration_hours', type: 'integer', default: 36 })
  expirationHours: number;

  @OneToMany(
    () => ProductSource,
    (productSource: ProductSource) => productSource.provider,
  )
  sources: ProductSource[];

  @OneToMany(() => Product, (product) => product.provider)
  products: Product[];

  @OneToMany(() => Label, (label) => label.provider)
  labels: Label[];

  @OneToMany(() => ProviderCategory, (category) => category.provider)
  categories: ProviderCategory[];
}
