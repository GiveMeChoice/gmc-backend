import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity({ name: 'gmc_brand' })
@Index(['providerId', 'code'], { unique: true })
export class Brand {
  constructor(providerId: string, title: string) {
    this.providerId = providerId;
    this.code = title;
  }

  public static factory(
    providerId: string,
    title: string,
    data: Partial<Brand>,
  ) {
    const brand = new Brand(providerId, title);
    Object.assign(brand, data);
    return brand;
  }

  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({ name: 'provider_id' })
  readonly providerId: string;

  @Column()
  readonly code: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  logo?: string;

  @Column({ name: 'info_link', nullable: true })
  infoLink?: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @OneToMany(() => Product, (product) => product.brand)
  products: Product[];
}
