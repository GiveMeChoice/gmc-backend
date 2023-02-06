import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { formatErrorMessage } from './format-error-message';

@Catch()
export class GlobalExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    Logger.error(exception);
    const message = formatErrorMessage(exception);
    Logger.error(message);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    response.status(httpStatus).json({
      message,
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
