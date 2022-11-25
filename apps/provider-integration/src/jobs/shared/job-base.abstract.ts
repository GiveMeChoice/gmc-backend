import { JobExecutionResult } from './job-execution-result.interface';
import { JobName } from './job-name.enum';
import { Job } from './job.interface';

export abstract class JobBase implements Job {
  constructor() {
    this.schedule = 'DEFAULT';
  }
  schedule: string;
  lastResults: JobExecutionResult[] = [];
  abstract getName(): JobName;
  abstract execute(): Promise<string>;

  addLast(result: JobExecutionResult): void {
    this.lastResults.push(result);
    if (this.lastResults.length > 5) {
      this.lastResults.shift();
    }
  }
}
