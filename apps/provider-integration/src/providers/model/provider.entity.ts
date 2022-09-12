import { Pipeline } from '@app/provider-integration/pipelines/model/pipeline.entity';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
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

  // @Column({
  //   type: 'enum',
  //   enum: MarketplaceKey,
  // })
  // marketplace: MarketplaceKey;

  @Column()
  description: string;

  @OneToMany(() => Pipeline, (pipeline: Pipeline) => pipeline.provider)
  pipelines: Pipeline[];
}
