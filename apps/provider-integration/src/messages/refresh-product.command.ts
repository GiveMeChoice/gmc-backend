import { MessageBase } from '@lib/messaging/interface/message-base.class';
import { RefreshProductCommandDataDto } from './dto/refresh-product-command.dto';

export class RefreshProductCommand extends MessageBase<RefreshProductCommandDataDto> {
  static readonly ROUTING_KEY = 'pi.product.refresh';
  static readonly QUEUE = 'pi.product.refresh';
  getRoutingKey() {
    return RefreshProductCommand.ROUTING_KEY;
  }
  getQueue(): string {
    return RefreshProductCommand.QUEUE;
  }
  data: RefreshProductCommandDataDto;
}
