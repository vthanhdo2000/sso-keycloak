import { ExceptionFilter, Catch, HttpException, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    // const request = ctx.getRequest<Request>();
    const httpStatus = exception.getStatus() ?? HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception.message ? exception.message : null;

    response.status(httpStatus).json({
      statusCode: httpStatus,
      name: exception.name,
      timestamp: new Date().toISOString(),
      message: exception['response']['message'] ? exception['response']['message'] : message,
    });
  }
}
