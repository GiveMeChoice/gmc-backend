import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { ProviderKey } from './enum/provider-key.enum';
import { ProductSource } from './product-source.entity';

@Entity({ name: 'pi_provider' })
export class Provider {
  // @PrimaryGeneratedColumn('uuid')
  // id: string;

  @PrimaryColumn({
    type: 'enum',
    enum: ProviderKey,
    enumName: 'pi_provider_id_enum',
  })
  id: ProviderKey;

  @Column()
  description: string;

  @OneToMany(
    () => ProductSource,
    (productSource: ProductSource) => productSource.provider,
  )
  sources: ProductSource[];
}
