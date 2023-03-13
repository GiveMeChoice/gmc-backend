import { MessageBase } from '@lib/messaging/interface/message-base.class';
import { IndexProductCommandDto as IndexProductCommandDto } from './dto/index-product-command.dto';

export class IndexProductCommand extends MessageBase<IndexProductCommandDto> {
  static readonly ROUTING_KEY = 'pi.product.index';
  static readonly QUEUE = 'pi.product.index';

  getRoutingKey() {
    return IndexProductCommand.ROUTING_KEY;
  }
  getQueue() {
    return IndexProductCommand.QUEUE;
  }
}