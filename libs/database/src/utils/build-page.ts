import { PageRequest } from '../interface/page-request.interface';
import { Page } from '../interface/page.interface';

export function buildPage<T>(
  data: any,
  total: number,
  req?: PageRequest,
): Page<T> {
  const page: any = {
    meta: {
      count: data.length,
      totalCount: total,
    },
  };
  if (req) {
    page.meta.pageNumber = Math.floor(req.skip / req.take);
    page.meta.pageSize = req.take;
    page.meta.totalPages = Math.ceil(total / req.take);
    if (req.order && Object.keys(req.order).length) {
      page.meta.sort = Object.keys(req.order)[0];
      page.meta.direction = req.order[page.meta.sort];
    }
  }
  page.data = data;
  return page;
}
