import { MessagingService } from '@lib/messaging';
import { Injectable, Logger } from '@nestjs/common';
import { IntegrateSourceCommand } from '../messages/integrate-source.command';
import { ProductSourcesService } from '../services/product-sources.service';
import { SourceDueMonitorResultDto } from './dto/source-due-monitor-result.dto';
import { JobName } from './shared/job-name.enum';
import { Job } from './shared/job.interface';

@Injectable()
export class SourceDueMonitorJob implements Job<SourceDueMonitorResultDto> {
  constructor(
    private readonly sourcesService: ProductSourcesService,
    private readonly messagingService: MessagingService,
  ) {}

  getName() {
    return JobName.SOURCE_DUE_MONITOR;
  }

  async execute(): Promise<SourceDueMonitorResultDto> {
    const dueSources = await this.sourcesService.findAllDue();
    for (const source of dueSources) {
      await this.messagingService.sendToQueue(
        new IntegrateSourceCommand({
          productSourceId: source.id,
        }),
      );
    }
    return {
      sourcesDue: dueSources.length,
    };
  }
}
