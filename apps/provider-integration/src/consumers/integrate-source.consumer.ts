import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Consumer } from '@lib/messaging/interface/consumer.interface';
import { DEFAULT_EXCHANGE } from '@lib/messaging/messaging.constants';
import { Injectable, Logger } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';
import { IntegrateSourceCommand } from '../messages/integrate-source.command';
import { ProductSourceStatus } from '../model/enum/product-source-status';
import { IntegrationService } from '../services/integration.service';
import { ProductSourcesService } from '../services/product-sources.service';

@Injectable()
export class IntegrateSourceConsumer
  implements Consumer<IntegrateSourceCommand>
{
  constructor(
    private readonly sourcesService: ProductSourcesService,
    private readonly integrationService: IntegrationService,
  ) {}

  @RabbitSubscribe({
    exchange: DEFAULT_EXCHANGE,
    routingKey: IntegrateSourceCommand.ROUTING_KEY,
    queue: IntegrateSourceCommand.QUEUE,
  })
  async receive(
    msg: IntegrateSourceCommand,
    amqpMsg: ConsumeMessage,
  ): Promise<void> {
    try {
      const { data } = msg;
      Logger.debug(
        `Command ${
          IntegrateSourceCommand.ROUTING_KEY
        } Received: ${JSON.stringify(data)}`,
      );
      const source = await this.sourcesService.findOne(data.productSourceId);
      if (
        // must be due and cant be DOWN or BUSY
        source.status === ProductSourceStatus.READY &&
        this.sourcesService.isDue(source)
      ) {
        await this.integrationService.inegrateSource(data.productSourceId);
      } else {
        Logger.debug(
          `Source is NOT due and/or READY... Will not be integrated: ${data.productSourceId}`,
        );
      }
      Logger.debug(
        `Command ${
          IntegrateSourceCommand.ROUTING_KEY
        } Completed: ${JSON.stringify(data)}`,
      );
    } catch (err) {
      Logger.error(
        `Command ${IntegrateSourceCommand.ROUTING_KEY} Error` +
          `${msg.data ? msg.data.productSourceId : ''}` +
          ' : ' +
          err,
      );
    }
  }
}
