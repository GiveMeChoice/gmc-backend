import { ConsumeMessage } from 'amqplib';

export interface Consumer<Event> {
  receive(msg: Event, amqpMsg: ConsumeMessage): Promise<void>;
}
