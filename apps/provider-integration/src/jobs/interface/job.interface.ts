import { JobKey } from '../job-key.enum';

export interface Job<T> {
  getName(): JobKey;
  execute(): Promise<T>;
}
