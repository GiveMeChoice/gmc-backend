import { Injectable, Logger } from '@nestjs/common';
import { JobKey } from './job-key.enum';
import { Job } from './interface/job.interface';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ProductSourcesService } from '../services/product-sources.service';

@Injectable()
export class SourceMonitorJob implements Job<void> {
  constructor(private readonly productSourcesService: ProductSourcesService) {}

  getName() {
    return JobKey.SOURCE_MONITOR;
  }

  @Cron(CronExpression.EVERY_10_SECONDS, {
    name: JobKey.SOURCE_MONITOR,
  })
  execute(): Promise<void> {
    Logger.log('RUNNING THE SOURCE MONITOR');
    return null;
  }
}
