import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { EventMessage } from './interface/event-message.interface';
import { DEFAULT_EXCHANGE } from './messaging.constants';

@Injectable()
export class MessagingService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async sendToQueue(event: EventMessage): Promise<void> {
    await this.amqpConnection.publish(
      DEFAULT_EXCHANGE,
      event.routingKey,
      event,
    );
  }
}
