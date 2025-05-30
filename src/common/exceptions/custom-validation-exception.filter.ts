// filters/custom-validation-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, BadRequestException } from '@nestjs/common';
import { Response } from 'express';

@Catch(BadRequestException)
export class CustomValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const exceptionResponse = exception.getResponse() as
      | string
      | { message: any; error: string; statusCode: number };

    let errors: string[] = [];
    let messageFields: { fieldName: string; message: string }[] = [];

    if (typeof exceptionResponse === 'object' && exceptionResponse['message']) {
      if (Array.isArray(exceptionResponse['message'])) {
        // Lỗi từ ValidationPipe
        errors = exceptionResponse['message'];
        const fieldNameSet = new Set<string>();
        messageFields = [];
        errors.forEach((msg) => {
          // Lấy từ đầu tiên trong message
          const firstWord = msg.split(' ')[0];
          // Nếu chưa tồn tại trong messageFields, thì thêm
          if (!fieldNameSet.has(firstWord)) {
            messageFields.push({
              fieldName: firstWord,
              message: 'IDG-00000004',
            });
            fieldNameSet.add(firstWord);
          }
        });
      } else {
        errors = [exceptionResponse['message']];
      }
    } else {
      errors = [exceptionResponse as string];
    }

    response.status(400).json({
      errors,
      messageFields,
      message: '',
      messageObjects: [],
      statusCode: '400',
      status: 'BAD_REQUEST',
      challengeCode: '11111',
    });
  }
}
