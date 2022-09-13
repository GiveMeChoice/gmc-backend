import { Provider } from '@app/provider-integration/providers/model/provider.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'pi_product_source' })
export class ProductSource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  description: string;

  @Column()
  location: string;

  @Column()
  active: boolean;

  @Column()
  category: string;

  @Column()
  subcategory1: string;

  @Column()
  subcategory2: string;

  @ManyToOne(() => Provider, (provider: Provider) => provider.productSources)
  @JoinColumn({ name: 'providerId' })
  provider: Provider;
}
