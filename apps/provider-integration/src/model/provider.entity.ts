import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Channel } from './channel.entity';
import { ProviderKey } from './enum/provider-key.enum';

@Entity({ name: 'pi_provider' })
@Unique(['key'])
export class Provider {
  constructor(key: ProviderKey) {
    this.key = key;
  }

  public static factory(key: ProviderKey, data: Partial<Provider>) {
    const provider = new Provider(key);
    Object.assign(provider, data);
    return provider;
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ProviderKey,
    enumName: 'pi_provider_key_enum',
  })
  key: ProviderKey;

  @Column()
  description: string;

  @Column({ default: false })
  active: boolean;

  @Column({ name: 'run_interval_hours', type: 'integer', default: 24 })
  runIntervalHours: number;

  @Column({ name: 'expiration_hours', type: 'integer', default: 36 })
  expirationHours: number;

  @OneToMany(() => Channel, (productSource: Channel) => productSource.provider)
  channels: Channel[];
}
