import { MessageBase } from 'libs/messaging/src/interface/message-base.class';
import { IntegrateSourceCommandDataDto } from './dto/integrate-source-command.dto';

export class IntegrateSourceCommand extends MessageBase<IntegrateSourceCommandDataDto> {
  static readonly ROUTING_KEY = 'pi.source.integrate';
  static readonly QUEUE = 'pi.source.integrate';
  getRoutingKey() {
    return IntegrateSourceCommand.ROUTING_KEY;
  }
  getQueue(): string {
    return IntegrateSourceCommand.QUEUE;
  }
}
