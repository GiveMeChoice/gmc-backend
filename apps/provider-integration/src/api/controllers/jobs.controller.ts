import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CronExpression } from '@nestjs/schedule';
import { JobStatus } from '../../jobs/shared/job-status.interface';
import { JobName } from '../../jobs/shared/job-name.enum';
import { JobsService } from '../../services/jobs.service';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsSerivce: JobsService) {}

  @Get()
  getAll(): JobStatus[] {
    return this.jobsSerivce.getAll();
  }

  @Get(':job')
  get(@Param('job') job: JobName): JobStatus[] {
    return [this.jobsSerivce.getOne(job)];
  }

  @Post(':job/execute')
  async run(@Param('job') job: JobName): Promise<any> {
    return await this.jobsSerivce.execute(job);
  }

  @Post(':job/start')
  start(@Param('job') job: JobName) {
    return this.jobsSerivce.startCron(job);
  }

  @Post(':job/stop')
  stop(@Param('job') job: JobName) {
    return this.jobsSerivce.stopCron(job);
  }

  @Post(':job/reschedule')
  reschedule(@Param('job') job: JobName, @Body('cron') cron: CronExpression) {
    return this.jobsSerivce.rescheduleCron(job, cron);
  }
}
