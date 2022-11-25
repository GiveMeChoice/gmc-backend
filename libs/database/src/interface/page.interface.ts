export interface Page<T> {
  meta: {
    count: number;
    totalCount: number;
    pageNumber?: number;
    pageSize?: number;
    totalPages?: number;
    sort?: string;
    direction?: string;
  };
  data: T[];
}
