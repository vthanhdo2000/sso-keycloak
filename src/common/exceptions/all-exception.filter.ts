import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

import { BaseExceptionFilter } from './base-exception.filter';
import { mapStatus } from '../utils/map-statuscode';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode: number;
    let errorResponse: any;

    if (exception instanceof BaseExceptionFilter) {
      console.log('start custom BaseExceptionFilter');
      const res = exception.getResponse() as any;
      statusCode = exception.getStatus();

      errorResponse = {
        ...res,
        status: HttpStatus[statusCode],
      };
    } else if (exception instanceof HttpException) {
      // Các lỗi chuẩn HttpException (BadRequest, NotFound, Conflict...)
      statusCode = exception.getStatus();
      const res: any = exception.getResponse();

      console.log(res);
      if ('messageFields' in res && Array.isArray(res.messageFields)) {
        errorResponse = {
          messageFields: res.messageFields,
          messageObjects: res.messageObjects,
          message: typeof res === 'string' ? res : res.message || 'Error',
          error: [typeof res === 'string' ? res : res.error || []],
          statusCode: res.statusCode,
          status: res.status,
        };
      } else {
        errorResponse = {
          messageFields: [],
          messageObjects: [],
          message: typeof res === 'string' ? res : res.message || 'Error',
          error: [typeof res === 'string' ? res : res.error || []],
          statusCode: statusCode,
          status: HttpStatus[statusCode],
        };
      }
    } else {
      // Lỗi không xác định
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      errorResponse = {
        messageFields: [],
        messageObjects: [],
        message: exception.message || 'Internal Server Error',
        error: [exception.message || 'Internal Server Error'],
        statusCode: statusCode,
        status: 'INTERNAL_SERVER_ERROR',
      };
    }

    response.status(statusCode).json(errorResponse);
  }
}
