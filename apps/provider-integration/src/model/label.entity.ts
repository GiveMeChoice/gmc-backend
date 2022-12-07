import {
  Column,
  Entity,
  Index,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity({ name: 'gmc_label' })
@Index(['providerId', 'title'], { unique: true })
export class Label {
  constructor(providerId: string, title: string) {
    this.providerId = providerId;
    this.title = title;
  }

  public static factory(
    providerId: string,
    title: string,
    data: Partial<Label>,
  ) {
    const label = new Label(providerId, title);
    Object.assign(label, data);
    return label;
  }

  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({ name: 'provider_id' })
  readonly providerId: string;

  @Column()
  readonly title: string;

  @Column({ nullable: true })
  icon?: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToMany(() => Product, (product) => product.labels)
  products: Product[];
}
