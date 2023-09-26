import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';
import { Consumer } from 'libs/messaging/src/interface/consumer.interface';
import {
  CHANNEL_HIGH,
  DEFAULT_EXCHANGE,
} from 'libs/messaging/src/messaging.constants';
import { IndexProductCommand } from '../messages/index-product.command';
import { ProductDocumentsService } from '../services/product-documents.service';

@Injectable()
export class IndexProductConsumer implements Consumer<IndexProductCommand> {
  private readonly logger = new Logger(IndexProductConsumer.name);

  constructor(private readonly indexService: ProductDocumentsService) {}

  @RabbitSubscribe({
    exchange: DEFAULT_EXCHANGE,
    routingKey: IndexProductCommand.ROUTING_KEY,
    queue: IndexProductCommand.QUEUE,
    queueOptions: { channel: CHANNEL_HIGH },
  })
  async receive(msg: IndexProductCommand, amqpMsg: ConsumeMessage) {
    try {
      this.logger.debug(
        `Command ${IndexProductCommand.ROUTING_KEY} Received: ${JSON.stringify(
          msg.data.productId,
        )}`,
      );
      await this.indexService.index(msg.data.productId);
    } catch (e) {
      this.logger.error(e);
    }
  }
}
