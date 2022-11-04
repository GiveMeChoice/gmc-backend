import { MessageBase } from '@lib/messaging/interface/message-base.class';
import { IntegrateProductCommandDataDto } from './dto/integrate-product-command-data.dto';

export class IntegrateProductCommand extends MessageBase<IntegrateProductCommandDataDto> {
  static readonly ROUTING_KEY = 'pi.integrate.product';
  static readonly QUEUE = 'pi.integrate.product';
  getRoutingKey() {
    return IntegrateProductCommand.ROUTING_KEY;
  }
  getQueue(): string {
    return IntegrateProductCommand.QUEUE;
  }
  data: IntegrateProductCommandDataDto;
}
