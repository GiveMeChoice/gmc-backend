import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Consumer } from '@lib/messaging/interface/consumer.interface';
import { DEFAULT_EXCHANGE } from '@lib/messaging/messaging.constants';
import { Injectable, Logger } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';
import { EtlService } from '../etl/etl.service';
import { IntegrateSourceCommand } from '../messages/integrate-source.command';
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
    const { data } = msg;
    Logger.debug(
      `Integrate Product Source Command Received: ${data.productSourceId}`,
    );
    try {
      if (await this.sourcesService.isDue(data.productSourceId)) {
        await this.integrationService.inegrateSource(data.productSourceId);
      }
    } catch (err) {
      Logger.error(msg.data.productSourceId + ' : ' + err);
    }
    Logger.debug(`Message completed: ${msg.data.productSourceId}`);
  }
}
