// common/interceptors/response.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const isDisabled = this.reflector.get<boolean>(
      'disableResponseInterceptor',
      context.getHandler(),
    );

    if (isDisabled) {
      return next.handle(); // skip format
    }

    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data) => ({
        statusCode,
        status: 'success',
        message: data?.message || 'Request successful',
        data: data?.data !== undefined ? data.data : data,
      })),
    );
  }
}
