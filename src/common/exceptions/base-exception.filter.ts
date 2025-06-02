// import { HttpException } from '@nestjs/common';

// export class BaseExceptionFilter extends HttpException {
//   constructor(
//     message: string,
//     error: string[] = [],
//     statusCode: number = 500,
//     additionalFields: { [key: string]: any } = {},
//   ) {
//     const responseBody = {
//       message,
//       error,
//       statusCode,
//       ...additionalFields,
//     };
//     super(responseBody, statusCode);
//   }
// }
import { HttpException, HttpStatus } from '@nestjs/common';

interface CustomExceptionResponse {
  message: string;
  error: string[];
  statusCode: number;
  // imgs?: Record<string, string>;
  // tampering?: Record<string, string>;
  // status: string;
  [key: string]: any; // Cho phép thêm các field động khác
}

export class CustomException extends HttpException {
  // constructor(response: CustomExceptionResponse) {
  //   super(response, response.statusCode);
  // }
  constructor(response: any) {
    super(response, response.statusCode || HttpStatus.CONFLICT);
  }
}
