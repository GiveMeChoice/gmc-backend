import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Consumer } from 'libs/messaging/src/interface/consumer.interface';
import {
  CHANNEL_HIGH,
  DEFAULT_EXCHANGE,
} from 'libs/messaging/src/messaging.constants';
import { ProductStatus } from '@app/provider-integration/model/enum/product-status.enum';
import { Injectable, Logger } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';
import { IntegrateProductCommand } from '../messages/integrate-product.command';
import { EtlService } from '../services/etl.service';
import { ProductsService } from '../services/products.service';

@Injectable()
export class RefreshProductConsumer
  implements Consumer<IntegrateProductCommand>
{
  private readonly logger = new Logger(RefreshProductConsumer.name);

  constructor(
    private readonly productsService: ProductsService,
    private readonly etlService: EtlService,
  ) {}

  @RabbitSubscribe({
    exchange: DEFAULT_EXCHANGE,
    routingKey: IntegrateProductCommand.ROUTING_KEY,
    queue: IntegrateProductCommand.QUEUE,
    queueOptions: { channel: CHANNEL_HIGH },
  })
  async receive(msg: IntegrateProductCommand, amqpMsg: ConsumeMessage) {
    try {
      this.logger.debug(
        `Command ${
          IntegrateProductCommand.ROUTING_KEY
        } Received: ${JSON.stringify(msg.data.productId)}`,
      );
      const { data } = msg;
      const status = await this.productsService.getCurrentStatus(
        data.productId,
      );
      if (status === ProductStatus.PENDING || status === ProductStatus.REMAP) {
        await this.etlService.refreshProduct(
          data.productId,
          data.runId,
          data.reason,
          data.skipCache,
        );
      } else {
        this.logger.debug(
          `Product is NOT in PENDING or REMAP status (will not be refreshed): ${data.productId}`,
        );
      }
      this.logger.debug(
        `Command ${
          IntegrateProductCommand.ROUTING_KEY
        } Completed: ${JSON.stringify(data.productId)}`,
      );
    } catch (err) {
      this.logger.error(
        `Command ${IntegrateProductCommand.ROUTING_KEY} Error` +
          `${msg.data ? msg.data.productId : ''}` +
          ' : ' +
          err,
      );
    }
  }
}
