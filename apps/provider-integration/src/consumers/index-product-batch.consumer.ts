import { RabbitSubscribe, ackErrorHandler } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';
import { Consumer } from 'libs/messaging/src/interface/consumer.interface';
import {
  CHANNEL_LOW,
  DEFAULT_EXCHANGE,
} from 'libs/messaging/src/messaging.constants';
import { IndexProductBatchCommand } from '../messages/index-product-batch.command';
import { ProductDocumentsService } from '../services/product-documents.service';
import { messageErrorHandler } from '@lib/messaging/error/error-handler';

@Injectable()
export class IndexProductBatchConsumer
  implements Consumer<IndexProductBatchCommand>
{
  private readonly logger = new Logger(IndexProductBatchConsumer.name);

  constructor(private readonly indexService: ProductDocumentsService) {}

  @RabbitSubscribe({
    exchange: DEFAULT_EXCHANGE,
    routingKey: IndexProductBatchCommand.ROUTING_KEY,
    queue: IndexProductBatchCommand.QUEUE,
    queueOptions: { channel: CHANNEL_LOW },
    errorHandler: messageErrorHandler,
  })
  async receive(msg: IndexProductBatchCommand, amqpMsg: ConsumeMessage) {
    try {
      this.logger.debug(
        `Command ${
          IndexProductBatchCommand.ROUTING_KEY
        } Received: ${JSON.stringify(msg.data.productIds.length)}`,
      );
      await this.indexService.indexBatch(msg.data.productIds);
    } catch (e) {
      this.logger.error(e);
    }
  }
}
