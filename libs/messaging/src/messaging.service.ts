import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { Message } from './interface/message.interface';
import { DEFAULT_EXCHANGE } from './messaging.constants';

@Injectable()
export class MessagingService {
  private readonly logger = new Logger(MessagingService.name);

  constructor(private readonly amqpConnection: AmqpConnection) {}

  async sendToQueue(message: Message<any>): Promise<void> {
    this.logger.debug(
      `Sending to ${message.getQueue()}: ${JSON.stringify(message.data)}`,
    );
    await this.amqpConnection.publish(
      DEFAULT_EXCHANGE,
      message.getRoutingKey(),
      message,
    );
  }
}
