import { MessageBase } from '@lib/messaging/interface/message-base.class';
import { IntegrateProductCommandDataDto } from './dto/integrate-product-command.dto';

export class IntegrateProductCommand extends MessageBase<IntegrateProductCommandDataDto> {
  static readonly ROUTING_KEY = 'pi.product.integrate';
  static readonly QUEUE = 'pi.product.integrate';
  getRoutingKey() {
    return IntegrateProductCommand.ROUTING_KEY;
  }
  getQueue(): string {
    return IntegrateProductCommand.QUEUE;
  }
  data: IntegrateProductCommandDataDto;
}
