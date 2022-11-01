import { Provider } from '@app/provider-integration/model/provider.entity';
import { Product } from '@lib/products/model/product.entity';
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
import { SourceRun } from './source-run.entity';

@Entity({ name: 'pi_product_source' })
@Unique(['providerId', 'identifier'])
export class ProductSource {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({
    type: 'enum',
    enum: ProviderKey,
    enumName: 'pi_provider_id_enum',
  })
  readonly providerId: ProviderKey;

  @Column()
  readonly identifier: string;

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

  @OneToMany(() => SourceRun, (run: SourceRun) => run.source)
  runs: SourceRun[];

  @ManyToOne(() => Provider, (provider: Provider) => provider.sources)
  @JoinColumn({ name: 'providerId' })
  provider: Provider;
}
