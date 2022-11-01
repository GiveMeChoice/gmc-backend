import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Consumer } from '@lib/messaging/interface/consumer.interface';
import {
  DEFAULT_EXCHANGE,
  SOURCE_PIPELINE_QUEUE,
} from '@lib/messaging/messaging.constants';
import { Injectable, Logger } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';
import { EtlService } from '../etl/etl.service';
import { ProductSourceDueEvent } from '../events/product-source-due.event';
import { ProductSourcesService } from '../services/product-sources.service';

@Injectable()
export class ProductSourceDueConsumer
  implements Consumer<ProductSourceDueEvent>
{
  constructor(
    private readonly productSourcesService: ProductSourcesService,
    private readonly etlService: EtlService,
  ) {}

  @RabbitSubscribe({
    exchange: DEFAULT_EXCHANGE,
    routingKey: 'pi.product-source.due',
    queue: SOURCE_PIPELINE_QUEUE,
  })
  async receive(
    msg: ProductSourceDueEvent,
    amqpMsg: ConsumeMessage,
  ): Promise<void> {
    Logger.debug(`Product Source Due Message Received: ${msg.data.sourceId}`);
    try {
      const source = await this.productSourcesService.findOne(
        msg.data.sourceId,
      );
      await this.etlService.runSourcePipeline(source);
    } catch (err) {
      Logger.error(msg.data.sourceId + ' : ' + err);
    }
    Logger.debug(`Message completed: ${msg.data.sourceId}`);
  }
}
