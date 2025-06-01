import { HttpException } from '@nestjs/common';

export class BaseExceptionFilter extends HttpException {
  constructor(
    message: string,
    error: string[] = [],
    statusCode: number = 500,
    additionalFields: { [key: string]: any } = {},
  ) {
    const responseBody = {
      message,
      error,
      statusCode,
      ...additionalFields,
    };
    super(responseBody, statusCode);
  }
}
