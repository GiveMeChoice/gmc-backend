export interface ExtractResult<T> {
  sourceDate: Date;
  fromCache: boolean;
  data: T;
}
