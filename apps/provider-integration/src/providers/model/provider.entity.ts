import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ProviderKey } from './enum/provider-key.enum';
import { ProviderSource } from './provider-source.entity';

@Entity({ name: 'pi_provider' })
@Unique(['key'])
export class Provider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ProviderKey,
  })
  key: ProviderKey;

  @Column()
  description: string;

  @OneToMany(
    () => ProviderSource,
    (productSource: ProviderSource) => productSource.provider,
  )
  sources: ProviderSource[];
}
