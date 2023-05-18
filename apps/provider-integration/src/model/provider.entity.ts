import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ProviderKey } from './enum/provider-key.enum';
import { Merchant } from './merchant.entity';
import { ProviderSource } from './provider-source.entity';

@Entity({ name: 'pi_provider' })
@Unique(['key'])
export class Provider {
  constructor(merchantId: string, key: ProviderKey) {
    this.merchantId = merchantId;
    this.key = key;
  }

  public static factory(
    merchantId: string,
    key: ProviderKey,
    data: Partial<Provider>,
  ) {
    const provider = new Provider(merchantId, key);
    Object.assign(provider, data);
    return provider;
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ProviderKey,
    enumName: 'pi_provider_id_enum',
  })
  key: ProviderKey;

  @Column({ name: 'merchant_id' })
  readonly merchantId: string;

  @Column()
  description: string;

  @Column({ default: false })
  active: boolean;

  @Column({ name: 'run_interval_hours', type: 'integer', default: 24 })
  runIntervalHours: number;

  @Column({ name: 'expiration_hours', type: 'integer', default: 36 })
  expirationHours: number;

  @ManyToOne(() => Merchant, (merchant) => merchant.providers)
  @JoinColumn({ name: 'merchant_id' })
  merchant: Merchant;

  @OneToMany(
    () => ProviderSource,
    (productSource: ProviderSource) => productSource.provider,
  )
  sources: ProviderSource[];
}
