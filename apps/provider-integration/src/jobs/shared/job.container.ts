import { Injectable, Logger } from '@nestjs/common';
import { JobName } from './job-name.enum';
import { Job } from './job.interface';

export const JOB_CONTAINER = 'JOB_CONTAINER';

@Injectable()
export class JobContainer {
  constructor(private readonly jobs: Job[]) {}

  public getJob(jobName: JobName): Job {
    try {
      const job = this.jobs.find((j) => j.getName() === jobName);
      if (job) return job;
    } catch (e) {
      Logger.error(e);
    }
    throw new Error(`Job not found: ${jobName}`);
  }
}
