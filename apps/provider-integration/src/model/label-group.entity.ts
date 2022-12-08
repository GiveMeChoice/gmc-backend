import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Label } from './label.entity';

@Entity({ name: 'gmc_label_group' })
@Unique(['name'])
export class LabelGroup {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column()
  readonly name: string;

  @OneToMany(() => Label, (label) => label.group)
  labels: Label[];
}
