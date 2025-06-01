import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { mapStatus } from '../utils/map-statuscode';

@Injectable()
export class CustomValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    const { metatype } = metadata;
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const messageFields = errors.map((err) => ({
        fieldName: err.property,
        message: mapStatus(400),
      }));
      const errorMessages = await errors.map((err) => {
        if (err.constraints) {
          console.log(err.constraints);
          return Object.values(err.constraints).join(', ');
        }
        return 'Invalid field';
      });

      const dataErr = {
        messageFields,
        messageObjects: [],
        message: 'IDG-000000423424',
        error: errorMessages,
        statusCode: 400,
        status: 'BAD_REQUEST',
      };
      console.log(dataErr);
      throw new BadRequestException(dataErr);
    }
    return value;
  }

  private toValidate(metatype: any): boolean {
    const types: any[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
