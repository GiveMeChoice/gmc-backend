import { EventMessage } from '@lib/messaging/interface/event-message.interface';

export class ProductSourceDueEvent implements EventMessage {
  routingKey: 'pi.product-source.due';
  data: {
    sourceId: string;
  };
}
