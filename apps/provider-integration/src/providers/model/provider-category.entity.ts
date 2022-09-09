import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Provider } from './provider.entity';

@Entity({ name: 'pi_provider_category' })
@Unique(['provider', 'category', 'subcategory1', 'subcategory2'])
export class ProviderCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Provider, (provider: Provider) => provider.categories)
  @JoinColumn({ name: 'providerId' })
  provider: Provider;

  @Column()
  category: string;

  @Column()
  subcategory1: string;

  @Column()
  subcategory2: string;

  @Column()
  location: string;

  @Column()
  description: string;
}
