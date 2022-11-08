import { Inject, Injectable, Logger } from '@nestjs/common';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob, CronTime } from 'cron';
import { JobName } from '../jobs/shared/job-name.enum';
import { JobStatus } from '../jobs/shared/job-status.interface';
import { JobContainer, JOB_CONTAINER } from '../jobs/shared/job.container';
import { formatErrorMessage } from '../utils/format-error-message';

@Injectable()
export class JobsService {
  constructor(
    @Inject(JOB_CONTAINER)
    private readonly jobContainer: JobContainer,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  async execute(jobName: JobName): Promise<any> {
    const job = this.jobContainer.getJob(jobName);
    Logger.debug(`Running job: ${jobName}`);
    try {
      const result = await job.execute();
      if (result) Logger.debug(`Job result: ${JSON.stringify(result)}`);
      Logger.debug(`Finished job: ${jobName}`);
      return result;
    } catch (err) {
      Logger.error(`Error running job ${jobName}: ${formatErrorMessage(err)}`);
    }
  }

  private findCronJob(jobName: JobName): CronJob {
    const job = this.schedulerRegistry.getCronJob(jobName);
    if (!job) {
      throw new Error(`Job ${jobName} not found!`);
    }
    return job;
  }

  startCron(jobName: JobName) {
    const job = this.findCronJob(jobName);
    Logger.log(`(Re)starting Cron Job ${jobName}`);
    job.start();
  }

  stopCron(jobName: JobName) {
    const job = this.findCronJob(jobName);
    Logger.log(`Stopping Cron Job ${jobName}`);
    job.stop();
  }

  updateCron(jobName: JobName, time: CronExpression) {
    const job = this.findCronJob(jobName);
    Logger.log(
      `Updating Cron Job ${jobName} to Schedule ${time} (${CronExpression[time]})`,
    );
    job.setTime(new CronTime(CronExpression[time]));
  }

  getAll(): JobStatus[] {
    const statuses: JobStatus[] = [];
    this.schedulerRegistry.getCronJobs().forEach((job, name) => {
      statuses.push(this.buildStatus(job, name));
    });
    return statuses;
  }

  getOne(jobName: JobName): JobStatus {
    const job = this.findCronJob(jobName);
    return this.buildStatus(job, jobName);
  }

  private buildStatus(job: CronJob, name: string): JobStatus {
    let next = null;
    try {
      next = job.nextDates(5);
    } catch (ignored) {}
    return {
      name,
      running: job.running,
      last: job.lastDate(),
      next,
    };
  }
}
