export interface Message<T> {
  getRoutingKey(): string;
  getQueue(): string;
  data: T;
}
