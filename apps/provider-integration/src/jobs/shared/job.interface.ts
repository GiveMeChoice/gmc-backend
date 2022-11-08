import { JobName } from './job-name.enum';

export interface Job<T> {
  getName(): JobName;
  execute(): Promise<T>;
}
