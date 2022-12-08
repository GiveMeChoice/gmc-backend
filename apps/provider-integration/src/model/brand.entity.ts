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
@Index(['providerId', 'title'], { unique: true })
export class Brand {
  constructor(providerId: string, title: string) {
    this.providerId = providerId;
    this.title = title;
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
  readonly title: string;

  @Column({ nullable: true })
  logo?: string;

  @Column({ name: 'info_link', nullable: true })
  infoLink?: string;

  @Column({ nullable: true })
  description?: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @OneToMany(() => Product, (product) => product.brand)
  products: Product[];
}
