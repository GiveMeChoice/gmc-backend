import { Body, Controller, Get, Logger, Param, Post } from '@nestjs/common';
import { JobStatus } from '../jobs/interface/job-status.interface';
import { JobKey } from '../jobs/job-key.enum';
import { JobsService } from '../services/jobs.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsSerivce: JobsService) {}

  @Get()
  getAll(): JobStatus[] {
    return this.jobsSerivce.getAll();
  }

  @Get(':job')
  get(@Param('job') job: JobKey): JobStatus[] {
    return [this.jobsSerivce.getOne(job)];
  }

  @Post(':job/execute')
  async run(@Param('job') job: JobKey): Promise<any> {
    return this.jobsSerivce.execute(job);
  }

  @Post(':job/start')
  start(@Param('job') job: JobKey) {
    return this.jobsSerivce.startCron(job);
  }

  @Post(':job/stop')
  stop(@Param('job') job: JobKey) {
    return this.jobsSerivce.stopCron(job);
  }

  @Post(':job/reschedule')
  reschedule(@Param('job') job: JobKey, @Body('cron') cron: CronExpression) {
    return this.jobsSerivce.updateCron(job, cron);
  }
}
