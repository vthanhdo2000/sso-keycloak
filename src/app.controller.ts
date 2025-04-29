import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @Get('healthcheck')
  async getHello(): Promise<object> {
    return {
      message: 'OK',
    };
  }
}
