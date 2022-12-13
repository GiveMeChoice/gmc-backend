import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Consumer } from '@lib/messaging/interface/consumer.interface';
import {
  CHANNEL_LOW,
  DEFAULT_EXCHANGE,
} from '@lib/messaging/messaging.constants';
import { Injectable, Logger } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';
import { IndexProductBatchCommand } from '../messages/index-product-batch.command';
import { ProductsService } from '../services/products.service';
import { formatErrorMessage } from '../utils/format-error-message';

@Injectable()
export class IndexProductBatchConsumer
  implements Consumer<IndexProductBatchCommand>
{
  constructor(private readonly productsService: ProductsService) {}

  @RabbitSubscribe({
    exchange: DEFAULT_EXCHANGE,
    routingKey: IndexProductBatchCommand.ROUTING_KEY,
    queue: IndexProductBatchCommand.QUEUE,
    queueOptions: { channel: CHANNEL_LOW },
  })
  async receive(msg: IndexProductBatchCommand, amqpMsg: ConsumeMessage) {
    try {
      Logger.debug(
        `Command ${
          IndexProductBatchCommand.ROUTING_KEY
        } Received: ${JSON.stringify(msg.data.productIds.length)}`,
      );
      await this.productsService.indexProductBatch(msg.data.productIds);
    } catch (e) {
      Logger.error(formatErrorMessage(e));
    }
  }
}
