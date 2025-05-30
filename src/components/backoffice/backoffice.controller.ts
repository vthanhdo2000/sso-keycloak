import { Controller, Get, HttpCode, Post, Res, UseInterceptors } from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { SkipResponseInterceptor } from 'src/common/decorators/skip-response.decorator';
import { LoggingInterceptor } from 'src/common/interceptors/logging.interceptor';

import { BackofficeService } from './backoffice.service';

@Controller('backoffice')
export class BackofficeController {
  constructor(private readonly backofficeService: BackofficeService) {}

  @Get('/query')
  @SkipResponseInterceptor()
  @UseInterceptors(LoggingInterceptor)
  async query(): Promise<any> {
    return await this.backofficeService.query();
  }

  @Get('/all')
  @UseInterceptors(LoggingInterceptor)
  async queryAll(): Promise<any> {
    return await this.backofficeService.queryAll();
  }

  @Post('/test-api')
  @SkipResponseInterceptor()
  @UseInterceptors(LoggingInterceptor)
  @HttpCode(200)
  async callApi3rd(): Promise<any> {
    return await this.backofficeService.callApi3rd();
  }
}
