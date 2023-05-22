import { MessageBase } from 'libs/messaging/src/interface/message-base.class';
import { IndexProductBatchCommandDto as IndexProductBatchCommandDto } from './dto/index-product-batch-command.dto';

export class IndexProductBatchCommand extends MessageBase<IndexProductBatchCommandDto> {
  static readonly ROUTING_KEY = 'pi.product-batch.index';
  static readonly QUEUE = 'pi.product-batch.index';

  getRoutingKey() {
    return IndexProductBatchCommand.ROUTING_KEY;
  }
  getQueue() {
    return IndexProductBatchCommand.QUEUE;
  }
}
