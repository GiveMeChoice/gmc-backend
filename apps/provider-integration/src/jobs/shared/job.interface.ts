import { JobExecutionResult } from './job-execution-result.interface';
import { JobName } from './job-name.enum';

export interface Job {
  schedule: string;
  lastResults: JobExecutionResult[];
  addLast(result: JobExecutionResult): void;
  getName(): JobName;
  execute(): Promise<string>;
}
