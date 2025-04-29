import { Controller, Get } from '@nestjs/common';

import { ApplicationService } from './application.service';
import { InfoDto } from './dto/info.dto';

@Controller()
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Get('info')
  async getApplicationInfo(): Promise<InfoDto> {
    return this.applicationService.getApplicationInfo();
  }

  @Get('parameters')
  async getApplicationParameters() {
    return this.applicationService.getApplicationParameters();
  }

  @Get('meta')
  async getApplicationMetaInformation() {
    return this.applicationService.getApplicationMetaInformation();
  }
}
