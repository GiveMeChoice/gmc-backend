import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Consumer } from 'libs/messaging/src/interface/consumer.interface';
import { DEFAULT_EXCHANGE } from 'libs/messaging/src/messaging.constants';
import { Injectable, Logger } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';
import { IntegrateSourceCommand } from '../messages/integrate-source.command';
import { ChannelStatus } from '../model/enum/channel-status';
import { IntegrationService } from '../services/integration.service';
import { ChannelsService } from '../services/channels.service';

@Injectable()
export class IntegrateSourceConsumer
  implements Consumer<IntegrateSourceCommand>
{
  private readonly logger = new Logger(IntegrateSourceConsumer.name);

  constructor(
    private readonly sourcesService: ChannelsService,
    private readonly etlService: IntegrationService,
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
      this.logger.debug(
        `Command ${
          IntegrateSourceCommand.ROUTING_KEY
        } Received: ${JSON.stringify(data)}`,
      );
      const source = await this.sourcesService.findOne(data.productSourceId);
      if (
        // must be due and cant be DOWN or BUSY
        source.status === ChannelStatus.READY &&
        this.sourcesService.isDue(source)
      ) {
        await this.etlService.inegrateProviderChannel(data.productSourceId);
      } else {
        this.logger.debug(
          `Source is NOT due and/or READY... Will not be integrated: ${data.productSourceId}`,
        );
      }
      this.logger.debug(
        `Command ${
          IntegrateSourceCommand.ROUTING_KEY
        } Completed: ${JSON.stringify(data)}`,
      );
    } catch (err) {
      this.logger.error(
        `Command ${IntegrateSourceCommand.ROUTING_KEY} Error` +
          `${msg.data ? msg.data.productSourceId : ''}` +
          ' : ' +
          err,
      );
    }
  }
}
