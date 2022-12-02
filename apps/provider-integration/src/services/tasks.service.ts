import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { JobName } from '../jobs/shared/job-name.enum';
import { JobsService } from './jobs.service';

@Injectable()
export class TasksService {
  constructor(private readonly jobsService: JobsService) {}

  @Cron(CronExpression.EVERY_YEAR, {
    name: JobName.SOURCE_DUE_MONITOR,
  })
  runSourceDueMonitor() {
    this.jobsService.execute(JobName.SOURCE_DUE_MONITOR);
  }

  @Cron(CronExpression.EVERY_YEAR, {
    name: JobName.PRODUCT_EXPIRED_MONITOR,
  })
  runProductExpiredMonitor() {
    this.jobsService.execute(JobName.PRODUCT_EXPIRED_MONITOR);
  }
}
