import { Provider } from '@app/provider-integration/providers/model/provider.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity({ name: 'pi_pipeline' })
@Unique(['provider', 'category', 'subcategory1', 'subcategory2'])
export class Pipeline {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Provider, (provider: Provider) => provider.pipelines)
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
