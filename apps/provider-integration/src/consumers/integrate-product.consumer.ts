import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Consumer } from '@lib/messaging/interface/consumer.interface';
import { DEFAULT_EXCHANGE } from '@lib/messaging/messaging.constants';
import { ProductsService } from '@lib/products';
import { ProductStatus } from '@lib/products/model/enum/product-status.enum';
import { Injectable, Logger } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';
import { EtlService } from '../etl/etl.service';
import { IntegrateProductCommand } from '../messages/integrate-product.command';

@Injectable()
export class IntegrateProductConsumer
  implements Consumer<IntegrateProductCommand>
{
  constructor(
    private readonly productsService: ProductsService,
    private readonly pipelinesService: EtlService,
  ) {}

  @RabbitSubscribe({
    exchange: DEFAULT_EXCHANGE,
    routingKey: IntegrateProductCommand.ROUTING_KEY,
    queue: IntegrateProductCommand.QUEUE,
  })
  async receive(msg: IntegrateProductCommand, amqpMsg: ConsumeMessage) {
    Logger.debug(`Product Created Message Received: ${msg.data.productId}`);
    try {
      const product = await this.productsService.findOne(msg.data.productId);
      Logger.debug(
        `product ${msg.data.productId} status is: ${product.status}`,
      );
      if (product.status === ProductStatus.INCOMPLETE) {
        // await this.pipelinesService.runProductPipeline(
        //   product.providerKey,
        //   product.providerId,
        // );
      }
    } catch (err) {
      Logger.error(msg.data.productId + ' : ' + err);
    }
    Logger.debug(`msg complete: ${msg.data.productId}`);
  }
}
