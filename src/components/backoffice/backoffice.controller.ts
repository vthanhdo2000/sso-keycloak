import { Controller, Get } from '@nestjs/common';
import { SkipResponseInterceptor } from 'src/common/decorators/skip-response.decorator';

import { BackofficeService } from './backoffice.service';

@Controller('backoffice')
export class BackofficeController {
  constructor(private readonly backofficeService: BackofficeService) {}

  @Get('/query')
  @SkipResponseInterceptor()
  async query(): Promise<any> {
    return this.backofficeService.query();
  }
}
