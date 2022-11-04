import { MessageBase } from '@lib/messaging/interface/message-base.class';
import { IntegrateSourceCommandDataDto } from './dto/integrate-source-command-data.dto';

export class IntegrateSourceCommand extends MessageBase<IntegrateSourceCommandDataDto> {
  static readonly ROUTING_KEY = 'pi.integrate.source';
  static readonly QUEUE = 'pi.integrate.source';
  getRoutingKey() {
    return IntegrateSourceCommand.ROUTING_KEY;
  }
  getQueue(): string {
    return IntegrateSourceCommand.QUEUE;
  }
  data: IntegrateSourceCommandDataDto;
}
