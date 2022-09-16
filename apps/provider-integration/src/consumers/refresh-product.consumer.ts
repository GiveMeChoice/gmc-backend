import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Consumer } from '@lib/messaging/interface/consumer.interface';
import {
  DEFAULT_EXCHANGE,
  PRODUCT_REFRESH_QUEUE,
} from '@lib/messaging/messaging.constants';
import { ProductsService } from '@lib/products';
import { Injectable, Logger } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';
import { ProductCreatedEvent } from 'libs/products/events/product-created.event';

@Injectable()
export class RefreshConsumer implements Consumer<ProductCreatedEvent> {
  constructor(private readonly productsService: ProductsService) {}

  @RabbitSubscribe({
    exchange: DEFAULT_EXCHANGE,
    routingKey: 'pi.product.*',
    queue: PRODUCT_REFRESH_QUEUE,
  })
  async receive(msg: ProductCreatedEvent, amqpMsg: ConsumeMessage) {
    Logger.debug(`Product Created Message Received: ${msg.data.productId}`);
    try {
      const product = await this.productsService.findOne(msg.data.productId);
      Logger.debug(
        `product ${msg.data.productId} status is: ${product.status}`,
      );
    } catch (err) {
      Logger.error(msg.data.productId + ' : ' + err);
    }
    Logger.debug(`msg complete: ${msg.data.productId}`);
  }
}
