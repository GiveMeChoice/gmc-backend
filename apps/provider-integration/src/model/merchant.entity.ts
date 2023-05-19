import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Channel } from './channel.entity';
import { MerchantKey } from './enum/merchant-key.enum';
import { Region } from './enum/region.enum';
import { MerchantBrand } from './merchant-brand.entity';
import { MerchantCategory } from './merchant-category.entity';
import { MerchantLabel } from './merchant-label.entity';
import { Product } from './product.entity';

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

  @Column({
    type: 'enum',
    enum: Region,
    enumName: 'gmc_region_enum',
  })
  region: Region;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true })
  url: string;

  @OneToMany(() => Channel, (channel) => channel.merchant)
  channels: Channel[];

  @OneToMany(() => Product, (product) => product.merchant)
  products: Product[];

  @OneToMany(() => MerchantLabel, (label) => label.merchant)
  labels: MerchantLabel[];

  @OneToMany(() => MerchantBrand, (brand) => brand.merchant)
  brands: MerchantBrand[];

  @OneToMany(() => MerchantCategory, (category) => category.merchant)
  categories: MerchantCategory[];
}
