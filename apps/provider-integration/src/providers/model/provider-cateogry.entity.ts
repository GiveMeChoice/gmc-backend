import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'pi_category' })
export class ProviderCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;
}
