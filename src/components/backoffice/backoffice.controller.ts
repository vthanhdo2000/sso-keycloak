import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { SkipResponseInterceptor } from 'src/common/decorators/skip-response.decorator';
import { LoggingInterceptor } from 'src/common/interceptors/logging.interceptor';

import { BackofficeService } from './backoffice.service';

@Controller('backoffice')
export class BackofficeController {
  constructor(private readonly backofficeService: BackofficeService) {}

  @Get('/query')
  @SkipResponseInterceptor()
  async query(): Promise<any> {
    return this.backofficeService.query();
  }

  @Get('/all')
  @UseInterceptors(LoggingInterceptor)
  async queryAll(): Promise<any> {
    return this.backofficeService.queryAll();
  }
}
