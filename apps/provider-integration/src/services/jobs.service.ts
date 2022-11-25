import { Inject, Injectable, Logger } from '@nestjs/common';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob, CronTime } from 'cron';
import * as moment from 'moment';
import { JobBase } from '../jobs/shared/job-base.abstract';
import { JobExecutionResult } from '../jobs/shared/job-execution-result.interface';
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

  async execute(jobName: JobName): Promise<JobExecutionResult> {
    const job: JobBase = this.jobContainer.getJob(jobName);
    Logger.debug(`Running job: ${jobName}`);
    const start = moment();
    const result: JobExecutionResult = {
      status: 'SUCCESS',
      runAt: start.toDate(),
      runTime: 0,
      message: '',
    };
    try {
      const message = await job.execute();
      Logger.debug(`Finished job ${jobName}: ${message}`);
      result.message = message;
    } catch (err) {
      const errorMessage = formatErrorMessage(err);
      Logger.error(`Error running job ${jobName}: ${errorMessage}`);
      result.message = errorMessage;
      result.status = 'ERROR';
    }
    result.runTime = moment().diff(start, 'seconds', true);
    job.addLast(result);
    return result;
  }

  private findCronJob(jobName: JobName): CronJob {
    const job = this.schedulerRegistry.getCronJob(jobName);
    if (!job) {
      throw new Error(`Job ${jobName} not found!`);
    }
    return job;
  }

  startCron(jobName: JobName): JobStatus {
    const job = this.findCronJob(jobName);
    Logger.log(`(Re)starting Cron Job ${jobName}`);
    job.start();
    return this.buildStatus(job, jobName);
  }

  stopCron(jobName: JobName): JobStatus {
    const job = this.findCronJob(jobName);
    Logger.log(`Stopping Cron Job ${jobName}`);
    job.stop();
    return this.buildStatus(job, jobName);
  }

  rescheduleCron(jobName: JobName, time: CronExpression): JobStatus {
    const cronJob = this.findCronJob(jobName);
    Logger.log(
      `Updating Cron Job ${jobName} to Schedule ${time} (${CronExpression[time]})`,
    );
    if (!CronExpression[time]) {
      throw new Error(`Invalid cron time value: ${time}`);
    }
    cronJob.setTime(new CronTime(CronExpression[time]));
    const job: JobBase = this.jobContainer.getJob(jobName);
    job.schedule = time;
    return this.buildStatus(cronJob, jobName);
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

  private buildStatus(cronJob: CronJob, name: string): JobStatus {
    const job: JobBase = this.jobContainer.getJob(name as JobName);
    let next = null;
    try {
      next = cronJob.nextDates(5);
    } catch (ignored) {}
    console.log(cronJob.lastDate);
    console.log(cronJob.lastDate());
    return {
      name,
      schedule: job.schedule,
      running: cronJob.running,
      last: job.lastResults,
      next,
    };
  }
}
