import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'gmc_product' })
@Index(['providerId', 'providerProductId'], { unique: true })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column()
  providerId: string;

  @Column()
  providerProductId: string;

  @Column({ nullable: true })
  title?: string;

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    nullable: true,
  })
  rating?: number;

  @Column({ nullable: true })
  ratingsTotal?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price?: number;

  @Column({ nullable: true })
  currency?: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ nullable: true })
  link?: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdOn: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedOn: Date;
}
