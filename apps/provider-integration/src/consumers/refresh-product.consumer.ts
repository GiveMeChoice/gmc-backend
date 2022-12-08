import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Consumer } from '@lib/messaging/interface/consumer.interface';
import { DEFAULT_EXCHANGE } from '@lib/messaging/messaging.constants';
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
  })
  async receive(msg: RefreshProductCommand, amqpMsg: ConsumeMessage) {
    const { data } = msg;
    Logger.debug(
      `Command ${RefreshProductCommand.ROUTING_KEY} Received: ${JSON.stringify(
        data,
      )}`,
    );
    try {
      const status = await this.productsService.getStatus(data.productId);
      if (status === ProductIntegrationStatus.PENDING) {
        // await this.integrationService.refreshProduct(
        //   data.productId,
        //   data.runId,
        //   data.skipCache,
        // );
      } else {
        Logger.debug(
          `Product is NOT in PENDING status (will not be refreshed): ${data.productId}`,
        );
      }
      Logger.debug(
        `Command ${
          RefreshProductCommand.ROUTING_KEY
        } Completed: ${JSON.stringify(data)}`,
      );
    } catch (err) {
      Logger.error(
        `Command ${RefreshProductCommand.ROUTING_KEY} Error` +
          data.productId +
          ' : ' +
          err,
      );
    }
  }
}
