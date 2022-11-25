import { JobExecutionResult } from './job-execution-result.interface';

export interface JobStatus {
  name: string;
  schedule: string;
  running: boolean;
  last: JobExecutionResult[];
  next: Date[];
}
