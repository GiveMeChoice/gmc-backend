import { EventMessage } from '@lib/messaging/interface/event-message.interface';

export class ProductCreatedEvent implements EventMessage {
  routingKey: 'product.created';
  data: {
    productId: string;
  };
}
