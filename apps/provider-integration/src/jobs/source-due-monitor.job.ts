import { MessagingService } from '@lib/messaging';
import { Injectable, Logger } from '@nestjs/common';
import { IntegrateSourceCommand } from '../messages/integrate-source.command';
import { ChannelsService } from '../services/channels.service';
import { JobBase } from './shared/job-base.abstract';
import { JobName } from './shared/job-name.enum';
import { Job } from './shared/job.interface';

@Injectable()
export class SourceDueMonitorJob extends JobBase {
  constructor(
    private readonly sourcesService: ChannelsService,
    private readonly messagingService: MessagingService,
  ) {
    super();
  }

  getName() {
    return JobName.SOURCE_DUE_MONITOR;
  }

  async execute() {
    const dueSources = await this.sourcesService.findAllDue();
    for (const source of dueSources) {
      await this.messagingService.sendToQueue(
        new IntegrateSourceCommand({
          productSourceId: source.id,
        }),
      );
    }
    return `Found and processed ${dueSources.length} product sources`;
  }
}
