import {
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { MerchantBrand } from './merchant-brand.entity';

@Entity({ name: 'gmc_brand' })
@Unique(['slug'])
export class GmcBrand {
  constructor(name: string, slug: string) {
    this.name = name;
    this.slug = slug;
  }

  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column()
  slug: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  logo?: string;

  @Column({ nullable: true })
  url?: string;

  @OneToOne(() => MerchantBrand, (merchantBrand) => merchantBrand.gmcBrand)
  merchantBrand: MerchantBrand;
}
