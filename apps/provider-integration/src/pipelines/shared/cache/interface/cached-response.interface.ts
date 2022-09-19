export interface CachedResponse<T> {
  retrievedAt: Date;
  data: T;
}
