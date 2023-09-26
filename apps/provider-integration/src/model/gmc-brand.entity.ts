import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MerchantBrand } from './merchant-brand.entity';

@Entity({ name: 'gmc_brand' })
// @Unique(['name'])
export class GmcBrand {
  constructor(name: string) {
    this.name = name;
  }

  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column()
  name: string;

  @OneToOne(() => MerchantBrand, (merchantBrand) => merchantBrand.gmcBrand)
  merchantBrand: MerchantBrand;
}
