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
@Unique(['provider', 'category'])
export class ProviderCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Provider, (provider: Provider) => provider.categories)
  @JoinColumn({ name: 'providerId' })
  provider: Provider;

  @Column()
  category: string;

  @Column()
  description: string;
}
