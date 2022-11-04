import { Message } from './message.interface';

export abstract class MessageBase<T> implements Message<T> {
  constructor(public data: T) {}
  abstract getRoutingKey();
  abstract getQueue();
}
