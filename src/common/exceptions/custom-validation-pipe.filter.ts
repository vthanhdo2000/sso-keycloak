import { ValidationPipe, BadRequestException, ValidationError, Injectable } from '@nestjs/common';

@Injectable()
export class CustomValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const errors: string[] = [];
        const messageFields: { fieldName: string; message: string }[] = [];

        const flattenErrors = (errorsArr: ValidationError[]) => {
          errorsArr.forEach((error) => {
            const fieldName = error.property;

            if (error.constraints) {
              Object.values(error.constraints).forEach((msg) => {
                errors.push(msg);
                messageFields.push({
                  fieldName,
                  message: 'IDG-00000004',
                });
              });
            }

            if (error.children && error.children.length) {
              flattenErrors(error.children);
            }
          });
        };

        flattenErrors(validationErrors);

        return new BadRequestException({
          errors,
          messageFields,
          message: '',
          messageObjects: [],
          statusCode: '400',
          status: 'BAD_REQUEST',
          challengeCode: '11111',
        });
      },
    });
  }
}
