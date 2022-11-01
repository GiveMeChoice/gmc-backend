import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob, CronTime } from 'cron';
import { JobStatus } from '../jobs/interface/job-status.interface';
import { Job } from '../jobs/interface/job.interface';
import { JobKey } from '../jobs/job-key.enum';
import { SourceMonitorJob } from '../jobs/source-monitor.job';

@Injectable()
export class JobsService {
  private readonly jobs: Job<any>[] = [];
  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    sourceMonitorJob: SourceMonitorJob,
  ) {
    this.jobs.push(sourceMonitorJob);
  }

  async execute(jobName: JobKey): Promise<any> {
    const job = this.jobs.find((j) => j.getName() === jobName);
    if (!job) {
      throw new Error(`Job ${jobName} not found!`);
    }
    return await job.execute();
  }

  private findCronJob(jobName: JobKey): CronJob {
    const job = this.schedulerRegistry.getCronJob(jobName);
    if (!job) {
      throw new Error(`Job ${jobName} not found!`);
    }
    return job;
  }

  startCron(jobName: JobKey) {
    const job = this.findCronJob(jobName);
    Logger.log(`(Re)starting Cron Job ${jobName}`);
    job.start();
  }

  stopCron(jobName: JobKey) {
    const job = this.findCronJob(jobName);
    Logger.log(`Stopping Cron Job ${jobName}`);
    job.stop();
  }

  updateCron(jobName: JobKey, time: CronExpression) {
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

  getOne(jobName: JobKey): JobStatus {
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
