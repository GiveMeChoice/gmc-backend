import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ProviderKey } from './enum/provider-key.enum';
import { ProviderCategory } from './provider-category.entity';

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
    () => ProviderCategory,
    (category: ProviderCategory) => category.provider,
  )
  categories: ProviderCategory[];
}
