import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Response } from 'express';
import { Observable, tap, catchError, throwError } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse<Response>();

    const { method, originalUrl } = request;
    const user = request['user']; // Đảm bảo Guard đã gán user vào request
    const userId = user?.id || 'Guest';

    // Nếu đã log rồi thì bỏ qua
    if (request.__isLogged__) {
      return next.handle();
    }

    // Gắn cờ để không log nhiều lần
    request.__isLogged__ = true;

    console.log('ASDFASDF: ', request.__isLogged__);
    return next.handle().pipe(
      tap((data) => {
        const statusCode = response.statusCode;
        const duration = Date.now() - now;

        const logMessage = {
          method,
          url: originalUrl,
          userId,
          statusCode,
          duration: `${duration}ms`,
          message: 'Success',
          response: data,
          transID: data.transactionID,
        };

        console.log('[API LOG - SUCCESS]', JSON.stringify(logMessage, null, 2));
      }),
      catchError((error) => {
        const duration = Date.now() - now;
        const statusCode = error?.status || 500;

        const logMessage = {
          method,
          url: originalUrl,
          userId,
          statusCode,
          duration: `${duration}ms`,
          message: error?.message || 'Internal Server Error',
          response: error?.response || null,
        };

        console.error('[API LOG - ERROR]', JSON.stringify(logMessage, null, 2));

        // Phải re-throw lỗi để không làm mất luồng xử lý
        return throwError(() => error);
      }),
    );
  }
}
