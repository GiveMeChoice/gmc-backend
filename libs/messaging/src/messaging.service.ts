import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { Message } from './interface/message.interface';
import { DEFAULT_EXCHANGE } from './messaging.constants';

@Injectable()
export class MessagingService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async sendToQueue(message: Message<any>): Promise<void> {
    Logger.debug(
      `Sending to ${message.getQueue()}: ${JSON.stringify(message.data)}`,
    );
    await this.amqpConnection.publish(
      DEFAULT_EXCHANGE,
      message.getRoutingKey(),
      message,
    );
  }
}
