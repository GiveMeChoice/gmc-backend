import { PageRequest } from '@lib/database/interface/page-request.interface';
import {
  ArgumentMetadata,
  Injectable,
  Logger,
  PipeTransform,
} from '@nestjs/common';
import { formatErrorMessage } from './format-error-message';

@Injectable()
export class TransformPageRequestPipe
  implements PipeTransform<string, PageRequest>
{
  private static readonly DEFAULT_PAGE_SIZE = 30;

  transform(query: any, metadata: ArgumentMetadata): PageRequest {
    try {
      const page = query.page ? Number(query.page) : 0;
      const size = query.size
        ? Number(query.size)
        : TransformPageRequestPipe.DEFAULT_PAGE_SIZE;
      const pageRequest = {
        order: {},
        skip: page * size,
        take: size,
      };
      if (query.sort) {
        pageRequest.order[query.sort] = query.direction
          ? query.direction
          : 'DESC';
      }
      return pageRequest;
    } catch (err) {
      Logger.error(formatErrorMessage(err));
    }

    return {
      skip: 0,
      take: TransformPageRequestPipe.DEFAULT_PAGE_SIZE,
    };
  }
}
