import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { MerchantBrand } from './merchant-brand.entity';
import { MerchantKey } from './enum/merchant-key.enum';
import { MerchantCategory } from './merchant-category.entity';
import { MerchantLabel } from './merchant-label.entity';
import { Product } from './product.entity';
import { Provider } from './provider.entity';

@Entity({ name: 'gmc_merchant' })
@Unique(['key'])
export class Merchant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: MerchantKey,
    enumName: 'gmc_merchant_key_enum',
  })
  key: MerchantKey;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'logo_url', nullable: true })
  logoUrl: string;

  @Column({ name: 'info_link', nullable: true })
  infoLink: string;

  @OneToMany(() => Product, (product) => product.merchant)
  products: Product[];

  @OneToMany(() => MerchantLabel, (label) => label.merchant)
  labels: MerchantLabel[];

  @OneToMany(() => MerchantBrand, (brand) => brand.merchant)
  brands: MerchantBrand[];

  @OneToMany(() => MerchantCategory, (category) => category.merchant)
  categories: MerchantCategory[];

  @OneToMany(() => Provider, (provider) => provider.merchant)
  providers: Provider[];
}
