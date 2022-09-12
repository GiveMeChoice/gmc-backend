import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'gmc_product' })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  providerId: string;

  @Column()
  providerKey: string;

  @Column()
  providerProductId: string;

  @Column()
  title: string;

  @Column()
  rating: number;

  @Column()
  ratingsTotal: number;

  @Column()
  price: number;

  @Column()
  currency: string;

  @Column()
  image: string;

  @Column()
  link: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdOn: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedOn: Date;
}
