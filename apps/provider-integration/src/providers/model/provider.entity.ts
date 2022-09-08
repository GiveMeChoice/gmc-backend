import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ProviderKey } from './provider-key.enum';

@Entity({ name: 'pi_provider' })
export class Provider {
  @PrimaryColumn({
    type: 'enum',
    enum: ProviderKey,
  })
  id: ProviderKey;

  @Column()
  description: string;
}
