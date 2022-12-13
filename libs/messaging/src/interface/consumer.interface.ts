import { ConsumeMessage } from 'amqplib';

export interface Consumer<Message> {
  receive(msg: Message, amqpMsg: ConsumeMessage);
}
