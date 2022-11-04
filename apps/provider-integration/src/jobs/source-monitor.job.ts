import { MessagingService } from '@lib/messaging';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IntegrateSourceCommand } from '../messages/integrate-source.command';
import { ProductSourcesService } from '../services/product-sources.service';
import { Job } from './interface/job.interface';
import { JobKey } from './job-key.enum';

@Injectable()
export class SourceMonitorJob implements Job<void> {
  constructor(
    private readonly sourcesService: ProductSourcesService,
    private readonly messagingService: MessagingService,
  ) {}

  getName() {
    return JobKey.SOURCE_MONITOR;
  }

  @Cron(CronExpression.EVERY_10_SECONDS, {
    name: JobKey.SOURCE_MONITOR,
  })
  async execute(): Promise<void> {
    Logger.log('RUNNING THE SOURCE MONITOR');
    for (const source of await this.sourcesService.findAllDue()) {
      await this.messagingService.sendToQueue(
        new IntegrateSourceCommand({
          productSourceId: source.id,
        }),
      );
    }
    return null;
  }
}
