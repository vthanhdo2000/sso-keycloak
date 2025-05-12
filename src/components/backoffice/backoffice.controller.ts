import { Controller, Get } from '@nestjs/common';

import { BackofficeService } from './backoffice.service';

@Controller('backoffice')
export class BackofficeController {
  constructor(private readonly backofficeService: BackofficeService) {}

  @Get('/query')
  async query() {
    return this.backofficeService.query();
  }
}
