import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Consumer } from '@lib/messaging/interface/consumer.interface';
import {
  CHANNEL_HIGH,
  DEFAULT_EXCHANGE,
} from '@lib/messaging/messaging.constants';
import { ProductIntegrationStatus } from '@app/provider-integration/model/enum/product-status.enum';
import { Injectable, Logger } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';
import { RefreshProductCommand } from '../messages/refresh-product.command';
import { IntegrationService } from '../services/integration.service';
import { ProductsService } from '../services/products.service';

@Injectable()
export class RefreshProductConsumer implements Consumer<RefreshProductCommand> {
  constructor(
    private readonly productsService: ProductsService,
    private readonly integrationService: IntegrationService,
  ) {}

  @RabbitSubscribe({
    exchange: DEFAULT_EXCHANGE,
    routingKey: RefreshProductCommand.ROUTING_KEY,
    queue: RefreshProductCommand.QUEUE,
    queueOptions: { channel: CHANNEL_HIGH },
  })
  async receive(msg: RefreshProductCommand, amqpMsg: ConsumeMessage) {
    try {
      Logger.debug(
        `Command ${
          RefreshProductCommand.ROUTING_KEY
        } Received: ${JSON.stringify(msg.data.productId)}`,
      );
      const { data } = msg;
      const status = await this.productsService.getStatus(data.productId);
      if (status === ProductIntegrationStatus.PENDING) {
        await this.integrationService.refreshProduct(
          data.productId,
          data.runId,
          data.reason,
          data.skipCache,
        );
      } else {
        Logger.debug(
          `Product is NOT in PENDING status (will not be refreshed): ${data.productId}`,
        );
      }
      Logger.debug(
        `Command ${
          RefreshProductCommand.ROUTING_KEY
        } Completed: ${JSON.stringify(data.productId)}`,
      );
    } catch (err) {
      Logger.error(
        `Command ${RefreshProductCommand.ROUTING_KEY} Error` +
          `${msg.data ? msg.data.productId : ''}` +
          ' : ' +
          err,
      );
    }
  }
}
