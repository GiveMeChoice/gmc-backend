import { Provider } from '@app/provider-integration/providers/model/provider.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ProviderSourceRun } from './provider-source-run.entity';

@Entity({ name: 'pi_provider_source' })
@Unique(['identifier'])
export class ProviderSource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  identifier: string;

  @Column()
  description: string;

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
