import { Provider } from '@app/provider-integration/providers/model/provider.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProviderSourceRun } from './provider-source-run.entity';

@Entity({ name: 'pi_provider_source' })
export class ProviderSource {
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

  @OneToMany(() => ProviderSourceRun, (run: ProviderSourceRun) => run.source)
  runs: ProviderSourceRun[];

  @ManyToOne(() => Provider, (provider: Provider) => provider.sources)
  @JoinColumn({ name: 'providerId' })
  provider: Provider;
}
