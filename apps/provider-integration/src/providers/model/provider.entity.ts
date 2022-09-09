import {
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ProviderCategory } from './provider-cateogry.entity';
import { ProviderKey } from './enum/provider-key.enum';

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
